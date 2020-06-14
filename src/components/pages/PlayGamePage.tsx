import React, { useContext, useEffect } from 'react';
import { useParams, Redirect } from 'react-router-dom';
import { useObserver } from 'mobx-react';
import { Player } from 'src/types';
import { StoreContext } from 'src/providers/StoreProvider';
import BoardImage from 'src/components/BoardImage';
import PlayerAvatar from 'src/components/PlayerAvatar';
import Alert from 'src/components/Alert';
import PlayerStatus from '../PlayerStatus';

export default () => {
  const { gameId } = useParams();
  const rootStore = useContext(StoreContext);
  const { gameStore, playerStore } = rootStore;

  if (!gameId) return <Redirect to="/" />;
  if (gameId !== gameStore.game.id) return <Redirect to={`/join/${gameId}`} />;

  useEffect(() => {
    rootStore.scrollToCurrentPlayer();
  }, []);

  return useObserver(() => (
    <section>
      <PlayerStatus />
      <BoardImage />
      <Alert />

      {Array.from(playerStore.players.values()).map((p: Player) => (
        <PlayerAvatar player={p} key={p.id} />
      ))}
    </section>
  ));
}