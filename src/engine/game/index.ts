import { autorun } from 'mobx';
import rootStore from 'src/stores';
import { GameState } from 'src/types';

const GameEventHandler = () => {
  const { gameStore, playerStore } = rootStore;
  let prevGameState = gameStore.game.state;
  const eventHandlers: { [key: number]: Function } = {
    [GameState.GAME_START]: () => {
      gameStore.setGameState(GameState.TURN_CHECK);
    },
    [GameState.TURN_CHECK]: () => {
      // Can player take their turn
      gameStore.setGameState(GameState.ZONE_CHECK);
    },
    [GameState.ZONE_CHECK]: () => {
      // Is player in a zone which needs action
      gameStore.setGameState(GameState.TURN_START);
    },
    [GameState.TURN_START]: () => {
      //
      gameStore.setGameState(GameState.ROLL_START);
    },
    [GameState.ROLL_START]: () => {

    },
    [GameState.TURN_SKIP]: () => {
      gameStore.setGameState(GameState.TURN_END);
    },
    [GameState.TURN_END]: () => {
      // Check for extra turns
      const playerIds = playerStore.ids;
      const currentPlayerIdx = playerIds.indexOf(gameStore.game.currentPlayerId);
      const nextPlayerIdx = (currentPlayerIdx + 1) % playerIds.length;
      const nextPlayerId = playerIds[nextPlayerIdx];

      gameStore.setCurrentPlayer(nextPlayerId);
      gameStore.setGameState(GameState.TURN_CHECK);
    }
  };

  autorun(() => {
    const { state } = gameStore.game;
    if (state === prevGameState || !gameStore.isMyTurn) return;
    console.log(`New game state: ${state}`);

    const handler = eventHandlers[state];
    if (handler) handler();
  });
};

export default GameEventHandler;