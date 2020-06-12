import React, { useContext } from 'react';
import { useParams, Redirect } from 'react-router-dom';
import { useObserver } from 'mobx-react';
import { StoreContext } from 'src/providers/StoreProvider';
import BoardImage from '../BoardImage';

export default () => {
  const { gameId } = useParams();
  const rootStore = useContext(StoreContext);
  const { gameStore, playerStore } = rootStore;

  if (!gameId) return <Redirect to="/" />;
  if (gameId !== gameStore.game.id) return <Redirect to={`/join/${gameId}`} />;

  return useObserver(() => (
    <section>
      <BoardImage />
    </section>
  ));
}