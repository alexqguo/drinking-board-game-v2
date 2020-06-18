import { autorun } from 'mobx';
import rootStore from 'src/stores';
import { GameState, TileSchema } from 'src/types';
import RuleEngine from 'src/engine/rules';
import AlertStore from 'src/stores/AlertStore';

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
      rootStore.scrollToCurrentPlayer();
      const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
      const isSkipped = currentPlayer.effects.skippedTurns.numTurns > 0;

      if (isSkipped) {
        // Trigger lost turn start?
      } else {
        gameStore.setGameState(GameState.ROLL_START);
      }
    },
    [GameState.ROLL_START]: () => {

    },
    [GameState.ROLL_END]: () => {
      // const roll = gameStore.game.currentRoll;
      // TODO - check move condition
      gameStore.setGameState(GameState.MOVE_CALCULATE);
    },
    [GameState.MOVE_CALCULATE]: async () => {
      const roll = gameStore.game.currentRoll!;
      const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
      // TODO - check speed modifiers, roll augmentation
      
      // TODO - check for mandatory spaces
      let firstMandatoryIndex = boardStore.boardSchema.tiles
        .slice(currentPlayer.tileIndex + 1, currentPlayer.tileIndex + 1 + roll)
        .findIndex((tile: TileSchema) => {
          return tile.mandatory;
          // TODO - OR anchor, OR custom mandatory
        });

      // TODO - check mandataorySkips
      // const numSpacesToAdvance = firstMandatoryIndex === -1 ? roll : firstMandatoryIndex + 1;
      const numSpacesToAdvance = 18;

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
      const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
      RuleEngine(currentPlayer.tileIndex);
    },
    [GameState.RULE_END]: () => {
      gameStore.setGameState(GameState.TURN_END);
    },
    [GameState.TURN_SKIP]: () => {
      gameStore.setGameState(GameState.TURN_END);
    },
    [GameState.TURN_END]: async () => {
      const playerIds = playerStore.ids;
      const { currentPlayerId } = gameStore.game;
      const currentPlayerIdx = playerIds.indexOf(currentPlayerId);
      const currentPlayer = playerStore.players.get(currentPlayerId)!;
      let nextPlayerId: string;

      if (currentPlayer.effects.extraTurns > 0) {
        nextPlayerId = currentPlayerId;
        await playerStore.updateEffects(currentPlayerId, {
          extraTurns: currentPlayer.effects.extraTurns - 1,
        });
      } else {
        const nextPlayerIdx = (currentPlayerIdx + 1) % playerIds.length;
        nextPlayerId = playerIds[nextPlayerIdx]; 
      }

      setTimeout(() => {
        gameStore.setCurrentPlayer(nextPlayerId);
        gameStore.update({
          state: GameState.TURN_CHECK,
          currentRoll: null,
        });
      }, 1000);
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
  start: () => {
    rootStore.gameStore.setGameState(GameState.GAME_START);
  },
  handleRoll: (roll: number) => {
    rootStore.gameStore.update({
      state: GameState.ROLL_END,
      currentRoll: roll,
    });
  },
  skipTurn: () => {
    rootStore.gameStore.setGameState(GameState.TURN_SKIP);
  },
  alertClose: () => {
    const { alertStore, gameStore } = rootStore;
    alertStore.clear();
    gameStore.setGameState(GameState.RULE_END);
  },
  handleAlertRoll: (key: string, rolls: number[]) => {
    const { alertStore } = rootStore;
    alertStore.updateDiceRollResult(key, rolls.join('|'));
  }
};

export default GameEventHandler;
export { uiActions };