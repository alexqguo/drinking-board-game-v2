import { autorun } from 'mobx';
import rootStore from 'src/stores';
import {
  GameState,
  TileSchema,
  AlertState,
  ZoneType,
  ZoneSchema,
  RuleHandler,
  AlertAction,
  Player,
} from 'src/types';
import RuleEngine, { getHandlerForRule } from 'src/engine/rules';
import { getAdjustedRoll } from 'src/engine/rules/SpeedModifierRule';
import {
  canPlayerMove,
  createTurnConditionRollActions,
} from 'src/engine/rules/ApplyMoveConditionRule';

const GameEventHandler = () => {
  const { gameStore, playerStore, boardStore, alertStore, extension } = rootStore;
  let prevGameState = gameStore.game.state;
  const eventHandlers: { [key: string]: Function } = {
    [GameState.STARTER_SELECT]: () => {},
    [GameState.GAME_START]: () => {
      gameStore.setGameState(GameState.TURN_CHECK);
    },
    [GameState.TURN_CHECK]: () => {
      // Can player take their turn
      const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
      if (currentPlayer.hasWon) {
        gameStore.setGameState(GameState.TURN_END);
      } else {
        gameStore.setGameState(GameState.ZONE_CHECK);
      }
    },
    [GameState.ZONE_CHECK]: async () => {
      // Is player in a zone which needs action
      const { schema } = boardStore;
      const { tiles, zones } = schema;
      const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
      const currentTile = tiles[currentPlayer.tileIndex];
      const currentZone: ZoneSchema = zones.find((z: ZoneSchema) => z.name === currentTile.zone)!;
      rootStore.scrollToCurrentPlayer();

      if (currentZone && currentZone.rule && currentZone.type === ZoneType.active) {
        const handler: RuleHandler = getHandlerForRule(currentZone.rule);
        await alertStore.update({
          open: true,
          state: AlertState.PENDING,
          nextGameState: GameState.TURN_START,
          ruleId: currentZone.rule.id,
        });
        handler(currentZone.rule);
      } else {
        gameStore.setGameState(GameState.TURN_START);
      }
    },
    [GameState.TURN_START]: async () => {
      const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
      const isSkipped = currentPlayer.effects.skippedTurns.numTurns > 0;

      if (isSkipped) {
        gameStore.setGameState(GameState.LOST_TURN_START);
      } else {
        const { moveCondition } = currentPlayer.effects;
        const conditionSchema = boardStore.rulesById.get(moveCondition.ruleId)?.condition;
        if (conditionSchema
          && conditionSchema.diceRolls
          && conditionSchema.diceRolls?.numRequired
          && conditionSchema.diceRolls?.numRequired > 1) {

          /**
           * If player has a move condition, and the ruleId of the condition is a multi roll:
           * - This means you need to roll multiple times to determine if you can even take your turn
           *   - Used for elite four and legendary birds
           *   - Arguably it's not really a move condition, it's more of a turn condition
           *   - (maybe create a different rule type for this in the future)
           */
          gameStore.setGameState(GameState.TURN_MULTIROLL_CONDITION_CHECK);
        } else {
          gameStore.setGameState(GameState.ROLL_START);
        }
      }
    },
    [GameState.TURN_MULTIROLL_CONDITION_CHECK]: () => {
      const { schema } = boardStore;
      const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
      const turnConditionRule = schema.tiles[currentPlayer.tileIndex].rule;

      alertStore.update({
        open: true,
        state: AlertState.REQUIRE_ACTION,
        ruleId: turnConditionRule.id,
      });
      createTurnConditionRollActions(turnConditionRule);
    },
    [GameState.ROLL_START]: () => {
      // Not really anything special to do here, but PlayerStatus references game state to enable rolling
    },
    [GameState.ROLL_END]: async () => {
      const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
      const { moveCondition } = currentPlayer.effects;

      if (moveCondition.ruleId === '') {
        gameStore.setGameState(GameState.MOVE_CALCULATE);
        return;
      }

      const roll = gameStore.game.currentRoll;
      const conditionSchema = boardStore.rulesById.get(moveCondition.ruleId)?.condition;

      // If there is a move condition with either no diceRolls specified or only requiring 1
      if (conditionSchema
        && (
          !conditionSchema.diceRolls
          || !conditionSchema.diceRolls.numRequired
          || conditionSchema.diceRolls?.numRequired === 1
        )
      ) {
        const result = await canPlayerMove(currentPlayer.id, conditionSchema, [roll!]);
        if (!result.canMove) {
          alertStore.update({
            open: true,
            messageOverride: result.message,
            state: AlertState.CAN_CLOSE,
            nextGameState: GameState.TURN_END,
          });
          return;
        }
      }

      gameStore.setGameState(GameState.MOVE_CALCULATE);
    },
    [GameState.MOVE_CALCULATE]: async () => {
      let roll = gameStore.game.currentRoll!;
      const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
      const { effects, tileIndex } = currentPlayer;

      if (effects.speedModifier.numTurns > 0) {
        roll = getAdjustedRoll(roll, effects.speedModifier);
        playerStore.updateEffects(currentPlayer.id, {
          speedModifier: {
            ...effects.speedModifier,
            numTurns: effects.speedModifier.numTurns - 1
          },
        });
      }

      let firstMandatoryIndex = boardStore.schema.tiles
        .slice(tileIndex + 1, tileIndex + 1 + roll)
        .findIndex((tile: TileSchema, idx: number) => {
          return tile.mandatory || effects.customMandatoryTileIndex === tileIndex + idx + 1;
        });

      if (effects.mandatorySkips > 0 && firstMandatoryIndex !== -1) {
        await playerStore.updateEffects(currentPlayer.id, {
          mandatorySkips: effects.mandatorySkips - 1,
        });
        firstMandatoryIndex = -1;
      }

      let numSpacesToAdvance = firstMandatoryIndex === -1 ? roll : firstMandatoryIndex + 1;
      // if (currentPlayer.name === 'asdf') numSpacesToAdvance = 34;

      // Get all other players with an anchor, and sort them by position to allow us to break on the earliest match
      const otherPlayersWithAnchors: Player[] = Array.from(playerStore.players.values())
        .filter(p => p.id !== currentPlayer.id && p.effects.anchors && p.effects.anchors > 0)
        .sort((p1, p2) => p1.tileIndex - p2.tileIndex);
      // For each players with anchors, if their position is within the range, modify numSpacesToAdvance and break
      for (let i = 0; i < otherPlayersWithAnchors.length; i++) {
        const p = otherPlayersWithAnchors[i];

        if (p.tileIndex >= currentPlayer.tileIndex && p.tileIndex <= tileIndex + numSpacesToAdvance) {
          numSpacesToAdvance = p.tileIndex - tileIndex;
          await playerStore.updateEffects(p.id, { anchors: p.effects.anchors - 1 });
          break;
        }
      }

      if (effects.customMandatoryTileIndex === tileIndex + numSpacesToAdvance) {
        await playerStore.updateEffects(currentPlayer.id, { customMandatoryTileIndex: -1 });
      }

      if (numSpacesToAdvance > 0) {
        await playerStore.updatePlayer(currentPlayer.id, {
          tileIndex: tileIndex + numSpacesToAdvance,
        });
        gameStore.setGameState(GameState.MOVE_START);
      } else {
        gameStore.setGameState(GameState.TURN_END);
      }
    },
    [GameState.MOVE_START]: () => {
      rootStore.scrollToCurrentPlayer();

      // Allow time for the "animation" to happen
      setTimeout(() => {
        gameStore.setGameState(GameState.MOVE_END);
      }, 750);
    },
    [GameState.MOVE_END]: () => {
      gameStore.setGameState(GameState.RULE_TRIGGER);
    },
    [GameState.RULE_TRIGGER]: () => {
      const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
      RuleEngine(boardStore.schema.tiles[currentPlayer.tileIndex].rule.id, {});
    },
    [GameState.RULE_END]: () => {
      gameStore.setGameState(GameState.TURN_END);
    },
    [GameState.TURN_SKIP]: () => {
      gameStore.setGameState(GameState.TURN_END);
    },
    [GameState.TURN_END]: async () => {
      const playerIds = playerStore.ids;
      const { currentPlayerId, turnOrder } = gameStore.game;
      const currentPlayerIdx = playerIds.indexOf(currentPlayerId);
      const currentPlayer = playerStore.players.get(currentPlayerId)!;
      let nextPlayerId: string;

      if (currentPlayer.effects.extraTurns > 0) {
        nextPlayerId = currentPlayerId;
        await playerStore.updateEffects(currentPlayerId, {
          extraTurns: currentPlayer.effects.extraTurns - 1,
        });
      } else {
        const pos = currentPlayerIdx + turnOrder;
        const length = playerIds.length;
        // Wrap back around if necessary
        const nextPlayerIdx = (pos < 0 ? length - (-pos % length) : pos) % length;
        nextPlayerId = playerIds[nextPlayerIdx];
      }

      await playerStore.addVisitedTile(currentPlayerId, currentPlayer.tileIndex);
      gameStore.update({
        state: GameState.TURN_CHECK,
        currentPlayerId: nextPlayerId,
        currentRoll: null,
      });
    },
    [GameState.LOST_TURN_START]: () => {
      const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
      playerStore.updateEffects(currentPlayer.id, {
        skippedTurns: {
          ...currentPlayer.effects.skippedTurns,
          numTurns: currentPlayer.effects.skippedTurns.numTurns - 1,
        }
      });
      alertStore.update({
        open: true,
        state: AlertState.CAN_CLOSE,
        nextGameState: GameState.TURN_END,
        ruleId: '',
        messageOverride: currentPlayer.effects.skippedTurns.message,
      });
    }
  };

  if (extension) {
    for (const [gameEventKey, customGameEventHandler] of Object.entries(extension.gameEvents)) {
      // Overwrite the default game event handler with any the extension defines
      eventHandlers[gameEventKey] = customGameEventHandler;
    }
  }

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
    const { gameStore, boardStore } = rootStore;

    // Only start the game if it hasn't been started. When joining game state will already exist
    if (gameStore.game.state === GameState.NOT_STARTED) {
      // If the first tile is a starter select rule, execute it
      if (boardStore.schema.tiles[0].rule.type === 'StarterSelectionRule') {
        gameStore.setGameState(GameState.STARTER_SELECT);
        RuleEngine(boardStore.schema.tiles[0].rule.id, {
          headingOverride: ' ', // TODO- put something more useful here?
          nextGameState: GameState.GAME_START,
        });
      } else {
        gameStore.setGameState(GameState.GAME_START);
      }
    }
  },
  handleRoll: (roll: number) => {
    rootStore.gameStore.update({
      state: GameState.ROLL_END,
      currentRoll: roll,
    });
  },
  handleRollAugmentation: (roll: number, playerId: string) => {
    const currentPlayer = rootStore.playerStore.players.get(playerId)!;
    const { effects } = currentPlayer;

    rootStore.playerStore.updateEffects(playerId, {
      rollAugmentation: {
        ...effects.rollAugmentation,
        numTurns: effects.rollAugmentation.numTurns - 1
      },
    });

    rootStore.gameStore.update({
      state: GameState.ROLL_END,
      currentRoll: roll,
    });
  },
  skipTurn: () => {
    rootStore.gameStore.setGameState(GameState.TURN_SKIP);
  },
  alertClose: async (nextState: GameState) => {
    if (!nextState) throw new Error('No nextState was defined when the modal closed.');

    const { alertStore, gameStore, actionStore } = rootStore;
    const { setGameState } = gameStore;
    await Promise.all([
      alertStore.clear(),
      actionStore.clear(),
    ]);
    setGameState(nextState);
  },
  // Will be deprecated in favor of handleActionRoll
  handleAlertRoll: (key: string, rolls: number[]) => {
    const { alertStore } = rootStore;
    alertStore.updateDiceRollResult(key, rolls.join('|'));
  },
  handleActionRoll: (roll: number, action: AlertAction) => {
    const { actionStore } = rootStore;
    actionStore.updateAction(action.id, { value: roll });
  },
  handleActionSelection: (selectionId: string, action: AlertAction) => {
    const { actionStore } = rootStore;
    actionStore.updateAction(action.id, { value: selectionId });
  },
};

export default GameEventHandler;
export { uiActions };