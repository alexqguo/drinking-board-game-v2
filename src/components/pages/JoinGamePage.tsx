import React, { useContext, useState, useEffect } from 'react';
import {
  Paragraph,
  Heading,
  FormField,
  TextInput,
  Button,
  TextInputField 
} from 'evergreen-ui';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { useParams, Redirect } from 'react-router-dom';
import { GameType, Player, SessionData } from 'src/types';
import { StoreContext } from 'src/providers/StoreProvider';

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
  const { gameId = '' } = useParams();
  const rootStore = useContext(StoreContext);
  const i18n = useContext(TranslationContext);
  const [joined, setJoined] = useState(false);
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
      }
    } catch (e) {
      console.error(e);
      updateState({ searchStatus: SearchStatus.notFound });
    }
  };
  const onInputChange = (e: Event) => {
    const newId: string = (e.target as HTMLInputElement).value;
    window.clearTimeout(timeout!);
    timeout = window.setTimeout(() => search(newId), 1000);
    updateState({ gameId: newId });
  };

  const joinGame = async () => {
    await rootStore.restoreSession({
      gameId: state.gameId,
      localPlayerId: state.selectedPlayerId,
      board: state.session!.game.board,
    });
      setJoined(true);
  };

  const canJoin = () => {
    if (!state.session) return false;
    if (state.searchStatus !== SearchStatus.found) return false;
    if (state.session?.game.type === GameType.local) return true;
    // TODO - handle remote game types
    return false;
  };

  useEffect(() => { if (gameId) search(gameId) }, []);
  if (joined) {
    console.log('joined ' + state.gameId)
    return <Redirect to={`/game/${state.gameId}`} />;
  }
  return (
    <section>
      <Heading is="h1" size={800}>
        {i18n.joinGame.title}
      </Heading>
      <TextInputField
        label={i18n.joinGame.gameId}
        onChange={(e: Event) => onInputChange(e)}
        width="50%"
        value={state.searchStatus === SearchStatus.searching ? i18n.joinGame.searching : state.gameId}
        disabled={state.searchStatus === SearchStatus.found || state.searchStatus === SearchStatus.searching}
        validationMessage={state.searchStatus === SearchStatus.notFound ? i18n.joinGame.notFound : null}
      />
      <Button
        disabled={!canJoin()}
        onClick={joinGame}
      >
        {i18n.joinGame.join}
      </Button>
    </section>
  );
}