import { autorun } from 'mobx';
import rootStore from 'src/stores';
import { GameState } from 'src/types';

const GameEventHandler = () => {
  const { gameStore, playerStore, boardStore } = rootStore;
  let prevGameState = gameStore.game.state;
  const eventHandlers: { [key: string]: Function } = {
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
    [GameState.ROLL_END]: () => {
      // const roll = gameStore.game.currentRoll;
      // TODO - check move condition
      setTimeout(() => {
        gameStore.setGameState(GameState.MOVE_CALCULATE);
      }, 1000);
      // gameStore.setGameState(GameState.MOVE_CALCULATE);
    },
    [GameState.MOVE_CALCULATE]: async () => {
      const roll = gameStore.game.currentRoll!;
      const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
      // TODO - check speed modifiers, roll augmentation
      
      // TODO - check for mandatory spaces
      let firstMandatoryIndex = boardStore.boardSchema.tiles
        .slice(currentPlayer.tileIndex + 1, currentPlayer.tileIndex + 1 + roll)
        .findIndex((tile: any) => {
          return tile.isMandatory;
          // TODO - OR anchor, OR custom mandatory
        });

      // TODO - check mandataorySkips
      const numSpacesToAdvance = firstMandatoryIndex === -1 ? roll : firstMandatoryIndex + 1;

      // TODO - if user is going to land on their custom mandatory, clear it
      if (numSpacesToAdvance > 0) {
        await playerStore.updatePlayer(currentPlayer.id, {
          tileIndex: currentPlayer.tileIndex + numSpacesToAdvance,
        });
        gameStore.setGameState(GameState.MOVE_START);
      } else {
        gameStore.setGameState(GameState.TURN_END);
      }
    },
    [GameState.MOVE_START]: () => {
      // TODO - scroll to current player's new location
      gameStore.setGameState(GameState.MOVE_END);
    },
    [GameState.MOVE_END]: () => {
      gameStore.setGameState(GameState.RULE_TRIGGER);
    },
    [GameState.RULE_TRIGGER]: () => {
      gameStore.setGameState(GameState.RULE_END);
    },
    [GameState.RULE_END]: () => {
      gameStore.setGameState(GameState.TURN_END);
    },
    [GameState.TURN_SKIP]: () => {
      gameStore.setGameState(GameState.TURN_END);
    },
    [GameState.TURN_END]: () => {
      // TODO - check for extra turns
      const playerIds = playerStore.ids;
      const currentPlayerIdx = playerIds.indexOf(gameStore.game.currentPlayerId);
      const nextPlayerIdx = (currentPlayerIdx + 1) % playerIds.length;
      const nextPlayerId = playerIds[nextPlayerIdx];

      gameStore.setCurrentPlayer(nextPlayerId);
      gameStore.update({
        state: GameState.TURN_CHECK,
        currentRoll: null,
      })
    }
  };

  autorun(() => {
    const { state } = gameStore.game;
    if (state === prevGameState || !gameStore.isMyTurn) return;
    console.log(`New game state: ${state}`);
    prevGameState = state;

    const handler = eventHandlers[state];
    if (handler) handler();
  });
};

// This file should be the only thing updating game.gameState.
// Provide some hooks for UI components 
const uiActions = {
  handleRoll: (roll: number) => {
    const { gameStore } = rootStore;
    gameStore.update({
      state: GameState.ROLL_END,
      currentRoll: roll,
    });
  },
  skipTurn: () => {
    const { gameStore } = rootStore;
    gameStore.setGameState(GameState.TURN_SKIP);
  }
};

export default GameEventHandler;
export { uiActions };