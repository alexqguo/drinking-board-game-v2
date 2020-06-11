import React, { useContext } from 'react';
import { useParams, Redirect } from 'react-router-dom';
import { useObserver } from 'mobx-react';
import { Text } from 'evergreen-ui';
import { StoreContext } from 'src/providers/StoreProvider';

export default () => {
  const { gameId } = useParams();
  const rootStore = useContext(StoreContext);
  const { gameStore, playerStore } = rootStore;
  // check if gameStore has an ID (aka is hydrated), if not redirect to the join game page
  if (!gameId || gameId !== gameStore.game.id) return <Redirect to="/" />;

  console.log('game id: ' + gameStore.game.id);
  return useObserver(() => (
    <div>
      <Text>
        Welcome to the game!
        {JSON.stringify(gameStore.game)}<br />
        {JSON.stringify(JSON.stringify(Array.from(playerStore.players.entries())))}
      </Text><br />
    </div>
  ));
}