import React, { useContext, useState, useEffect } from 'react';
import { ref, DatabaseReference, onValue, DataSnapshot } from 'firebase/database';
import {
  Title,
  Text,
  Button,
  Radio,
  RadioGroup,
  TextInput,
} from '@mantine/core';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { useParams, Redirect } from 'react-router-dom';
import { GameType, Player, SessionData } from 'src/types';
import { StoreContext } from 'src/providers/StoreProvider';
import { db } from 'src/firebase';
import RootStore from 'src/stores/RootStore';
import CenterLayout from 'src/components/CenterLayout';
import Loading from 'src/components/Loading';

enum SearchStatus {
  idle,
  found,
  notFound,
  searching,
}

interface State {
  gameId: string,
  searchStatus: SearchStatus,
  session?: SessionData
  selectedPlayerId: string,
}

let timeout: number | null = null;

export default () => {
  const { gameId = '' } = useParams<{gameId?: string}>();
  const rootStore = useContext(StoreContext);
  const i18n = useContext(TranslationContext);
  const [joined, setJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<State>({
    gameId,
    searchStatus: gameId ? SearchStatus.searching : SearchStatus.idle,
    selectedPlayerId: '',
  });

  const updateState = (newState: Object) => setState({ ...state, ...newState });
  const search = async (gameId: string) => {
    updateState({ searchStatus: SearchStatus.searching });
    try {
      const session = await rootStore.findSession(gameId);
      if (!session) {
        updateState({ searchStatus: SearchStatus.notFound });
      } else {
        updateState({
          gameId,
          session,
          searchStatus: SearchStatus.found,
        });

        // If it's a remote game, ensure we update state when session data changes
        if (session.game.type === GameType.remote) {
          const dbRef: DatabaseReference = ref(db, RootStore.createPrefix(gameId));

          onValue(dbRef, (snap: DataSnapshot) => {
            updateState({
              session: snap.val(),
              searchStatus: SearchStatus.found,
            });
          });
        }
      }
    } catch (e) {
      console.error(e);
      updateState({ searchStatus: SearchStatus.notFound });
    }
  };
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newId: string = e.target.value;
    window.clearTimeout(timeout!);
    timeout = window.setTimeout(() => search(newId), 1000);
    updateState({ gameId: newId });
  };

  const joinGame = async () => {
    setIsLoading(true);
    await rootStore.restoreSession({
      gameId: state.gameId,
      localPlayerId: state.selectedPlayerId,
      board: state.session!.game.board,
    });
    setJoined(true);
  };

  const canJoin = () => {
    const { session, searchStatus, selectedPlayerId } = state;
    if (!session) return false;
    if (searchStatus !== SearchStatus.found) return false;
    if (session?.game.type === GameType.local) return true;

    const selectedPlayer = session.players.find((p: Player) => p.id === selectedPlayerId);
    return selectedPlayer && !selectedPlayer.isActive;
  };

  useEffect(() => { if (gameId) search(gameId) }, []);

  if (joined) {
    console.log('joined ' + state.gameId)
    return <Redirect to={`/game/${state.gameId}`} />;
  }

  if (isLoading) return <Loading />;

  return (
    <CenterLayout>
      <>
        <Title order={1} mb="md">
          {i18n.joinGame.title}
        </Title>

        <Text component="p" mb="md">
          {i18n.joinGame.explanation}
        </Text>

        <TextInput
          mb="md"
          width="100%"
          label={i18n.joinGame.gameId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange(e)}
          value={state.searchStatus === SearchStatus.searching ? i18n.joinGame.searching : state.gameId}
          disabled={state.searchStatus === SearchStatus.found || state.searchStatus === SearchStatus.searching}
          error={state.searchStatus === SearchStatus.notFound ? i18n.joinGame.notFound : null}
        />

        {state.session && state.session.game && state.session.game.type === GameType.remote ?
          <RadioGroup
            label={i18n.joinGame.selectPlayer}
            orientation="vertical"
            mb="md"
            onChange={(newValue) => updateState({ selectedPlayerId: newValue})}
          >
            {state.session.players.map((p: Player) => (
              <Radio
                name="remote-player-selection"
                // onChange={(e) => updateState({ selectedPlayerId: e.target.value })}
                disabled={p.isActive}
                label={p.name}
                value={p.id}
                key={p.id}
              />
            ))}
          </RadioGroup>
        : null}

        <Button
          disabled={!canJoin()}
          onClick={joinGame}
        >
          {i18n.joinGame.join}
        </Button>

        <Text size="sm" mt="md">
          <a href="/">{i18n.home.backLink}</a>
        </Text>
      </>
    </CenterLayout>
  );
}