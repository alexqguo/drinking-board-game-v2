import { autorun } from 'mobx';
import rootStore from 'src/stores';
import { GameState, TileSchema, AlertState } from 'src/types';
import RuleEngine from 'src/engine/rules';
import { getAdjustedRoll } from 'src/engine/rules/SpeedModifierRule';

const GameEventHandler = () => {
  const { gameStore, playerStore, boardStore, alertStore } = rootStore;
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
        gameStore.setGameState(GameState.LOST_TURN_START);
      } else {
        gameStore.setGameState(GameState.ROLL_START);
      }
    },
    [GameState.ROLL_START]: () => {
      // Not really anything special to do here I guess
    },
    [GameState.ROLL_END]: () => {
      // const roll = gameStore.game.currentRoll;
      // TODO - check move condition
      gameStore.setGameState(GameState.MOVE_CALCULATE);
    },
    [GameState.MOVE_CALCULATE]: async () => {
      let roll = gameStore.game.currentRoll!;
      const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
      // TODO - check speed modifiers, roll augmentation

      if (currentPlayer.effects.speedModifier.numTurns > 0) {
        roll = getAdjustedRoll(roll, currentPlayer.effects.speedModifier);
        playerStore.updateEffects(currentPlayer.id, {
          speedModifier: {
            ...currentPlayer.effects.speedModifier,
            numTurns: currentPlayer.effects.speedModifier.numTurns - 1
          },
        });
      }
      
      // TODO - check for mandatory spaces
      let firstMandatoryIndex = boardStore.boardSchema.tiles
        .slice(currentPlayer.tileIndex + 1, currentPlayer.tileIndex + 1 + roll)
        .findIndex((tile: TileSchema) => {
          return tile.mandatory;
          // TODO - OR anchor, OR custom mandatory
        });

      // TODO - check mandataorySkips
      const numSpacesToAdvance = firstMandatoryIndex === -1 ? roll : firstMandatoryIndex + 1;
      // const numSpacesToAdvance = 54;

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
    },
    [GameState.LOST_TURN_START]: () => {
      const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
      // decrement lost turns of player, set modal
      playerStore.updateEffects(currentPlayer.id, {
        skippedTurns: {
          ...currentPlayer.effects.skippedTurns,
          numTurns: currentPlayer.effects.skippedTurns.numTurns - 1,
        }
      });
      alertStore.update({
        open: true,
        state: AlertState.CAN_CLOSE,
        ruleIdx: -1,
        messageOverride: currentPlayer.effects.skippedTurns.message,
      });
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
    // Only start the game if it hasn't been started. When joining game state will already exist
    if (rootStore.gameStore.game.state === GameState.NOT_STARTED) {
      rootStore.gameStore.setGameState(GameState.GAME_START);
    }
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
    // TODO - will need to check here whether or not to trigger zone end or rule end
  },
  handleAlertRoll: (key: string, rolls: number[]) => {
    const { alertStore } = rootStore;
    alertStore.updateDiceRollResult(key, rolls.join('|'));
  }
};

export default GameEventHandler;
export { uiActions };