import * as React from 'react';
import { useContext } from 'react';
// import { useParams } from 'react-router-dom';
import { useObserver } from 'mobx-react';
import { Text, Button } from 'evergreen-ui';
import { StoreContext } from 'src/providers/StoreProvider';

export default () => {
  // const { gameId } = useParams();
  const rootStore = useContext(StoreContext);
  const { gameStore } = rootStore;
  // check if gameStore has an ID (aka is hydrated), if not redirect to the join game page

  console.log('game id: ' + gameStore.gameId);
  return useObserver(() => (
    <div>
      <Text>
        Welcome to the game!
        game id: {gameStore.gameId}
      </Text><br />
      <Button onClick={() => gameStore.setGameId(Date())}>
        Set game ID
      </Button>
    </div>
  ));
}