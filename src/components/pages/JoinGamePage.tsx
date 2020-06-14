import React, { useContext, useState, useEffect } from 'react';
import {
  Paragraph,
  Heading,
  FormField,
  TextInput,
  Button,
  TextInputField 
} from 'evergreen-ui';
import debounce from 'lodash/debounce';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { useParams } from 'react-router-dom';
import { GameType, Player } from 'src/types';
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
  gameType?: GameType,
  players?: Player[],
  selectedPlayerId: string,
}

let timeout: number | null = null;

export default () => {
  const { gameId = '' } = useParams();
  const rootStore = useContext(StoreContext);
  const i18n = useContext(TranslationContext);
  const [state, setState] = useState<State>({
    gameId,
    searchStatus: gameId ? SearchStatus.searching : SearchStatus.idle,
    selectedPlayerId: '',
  });
  const updateState = (newState: Object) => setState({ ...state, ...newState });
  const search = async (gameId: string) => {
    updateState({ searchStatus: SearchStatus.searching });
    const session = await rootStore.findSession(gameId);
    if (!session) {
      updateState({ searchStatus: SearchStatus.notFound });
    } else {
      updateState({ searchStatus: SearchStatus.found, gameId });
      console.log(session);
    }
  };
  const onInputChange = (e: Event) => {
    const newId: string = (e.target as HTMLInputElement).value;
    window.clearTimeout(timeout!);
    timeout = window.setTimeout(() => search(newId), 1000);
    updateState({ gameId: newId });
  };

  useEffect(() => { if (gameId) search(gameId) }, []);
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

    </section>
  );
}