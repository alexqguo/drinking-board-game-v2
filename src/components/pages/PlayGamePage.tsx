import React, { useContext, useEffect } from 'react';
import { useParams, useHistory, Redirect } from 'react-router-dom';
import { useObserver } from 'mobx-react';
import { Player } from 'src/types';
import { TranslationContext, formatString } from 'src/providers/TranslationProvider';
import { StoreContext } from 'src/providers/StoreProvider';
import BoardImage from 'src/components/BoardImage';
import PlayerAvatar from 'src/components/PlayerAvatar';
import Alert from 'src/components/Alert';
import PlayerStatus from 'src/components/PlayerStatus';
import Toolbar from 'src/components/Toolbar';
import { uiActions } from 'src/engine/game';

export default () => {
  const history = useHistory();
  const i18n = useContext(TranslationContext);
  const { gameId } = useParams<{gameId?: string}>();
  const rootStore = useContext(StoreContext);
  const { gameStore, playerStore } = rootStore;
  const localPlayer: Player | undefined = playerStore.players.get(gameStore.localPlayerId);

  useEffect(() => {
    uiActions.start();
    rootStore.scrollToCurrentPlayer();
  }, []);

  useEffect(() => {
    // Edge case- if another player tries to join as the current player, refresh this page to kick out this player
    // Ultimately this should be solved with accounts, auth, etc
    (async () => {
      if (localPlayer && !localPlayer.isActive) {
        await alert(formatString(i18n.joinGame.refreshing, { playerName: localPlayer.name }));
        // Using history.push instead of a full reload because the preventative message will pop up in that case
        history.push('/');
      }
    })();
  }, [localPlayer, history]);

  if (!gameId) return <Redirect to="/" />;
  if (gameId !== gameStore.game.id) return <Redirect to={`/join/${gameId}`} />;

  return useObserver(() => (
    <section>
      <PlayerStatus />
      <BoardImage />
      <Alert />
      <Toolbar />

      {Array.from(playerStore.players.values()).map((p: Player) => (
        <PlayerAvatar player={p} key={p.id} />
      ))}
    </section>
  ));
};