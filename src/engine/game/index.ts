import { autorun } from 'mobx';
import rootStore from 'src/stores';

const GameEventHandler = () => {
  const { gameStore } = rootStore;
  let prevGameState = gameStore.game.state;
  const eventHandlers = {

  };

  autorun(() => {
    const { state } = gameStore.game;
    if (state === prevGameState || !gameStore.isMyTurn) return;

    console.log(`new game state: ${state}`);
  });
};

export default GameEventHandler;