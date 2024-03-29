import rootStore from 'src/stores';
import {
  RuleSchema,
  RuleHandler,
  AlertState,
  MoveConditionSchema,
  DiceRollType,
  MoveConditionResult,
  AlertAction,
  PlayerTarget,
  ActionType,
  ActionStatus,
  GameState
} from 'src/types';
import { validateRequired, getHandlerForRule } from 'src/engine/rules';
import PlayerStore from 'src/stores/PlayerStore';
import { formatString } from 'src/providers/TranslationProvider';
import en from 'src/i18n/en_US.json';
import { createId } from 'src/utils';
import ActionStore from 'src/stores/ActionStore';

const isDiceRollSuccessful = (cond: MoveConditionSchema, rolls: number[]) => {
  const { diceRolls, criteria } = cond;

  // If the condition only requires one roll, success is when the first roll is in the criteria
  if (!diceRolls || diceRolls.numRequired === 1) {
    return criteria.indexOf(rolls[0]) !== -1;
  }

  // If the dice roll type is allMatch, then every roll must be listed in criteria
  if (diceRolls && diceRolls.type === DiceRollType.allMatch) {
    return rolls.every((roll: number) => criteria.indexOf(roll) !== -1);
  }

  // Shouldn't happen, but let the player proceed if so
  return true;
}

export const canPlayerMove = async (
  playerId: string,
  condition: MoveConditionSchema,
  rolls: number[]
): Promise<MoveConditionResult> => {
  const { playerStore } = rootStore;

  const isSuccessfulRoll = isDiceRollSuccessful(condition, rolls);
  if (!isSuccessfulRoll) {
    /**
     * A bit confusing. If successes are required, you still have to achieve the criteria on your next turn.
     * However if successes are NOT required, even if you fail you will move normally on your next turn.
     * So in that case we clear the condition even in a failure case.
     */
    if (!condition.numSuccessesRequired) {
      await playerStore.updateEffects(playerId, {
        moveCondition: PlayerStore.defaultEffects().moveCondition
      });
    }

    if (condition.consequence) {
      // This is only used in Gen 2 Ilex Forest
      const handler = getHandlerForRule(condition.consequence);
      handler(condition.consequence);
    }

    return {
      canMove: false,
      message: formatString(en.moveCondition.notMet, {
        condition: condition.description,
        rollStr: rolls.join(', '),
      }),
    }
  }

  const player = playerStore.players.get(playerId)!;
  const newSuccessCount = player.effects.moveCondition.numCurrentSuccesses + 1;

  // Successful roll and num successes met
  if (!condition.numSuccessesRequired || newSuccessCount >= condition.numSuccessesRequired) {
    await playerStore.updateEffects(playerId, {
      moveCondition: PlayerStore.defaultEffects().moveCondition,
    });

    return {
      canMove: true,
      message: '', // Game engine will ignore it
    }
  }

  // Successful roll but total num successes not yet met
  // Increment successes on player
  await playerStore.updateEffects(playerId, {
    moveCondition: {
      ...player.effects.moveCondition,
      numCurrentSuccesses: newSuccessCount,
    },
  });

  return {
    canMove: false,
    message: formatString(en.moveCondition.met, {
      cur: `${newSuccessCount}`,
      total: `${condition.numSuccessesRequired}`,
    }),
  };
}

// For use in the game engine on a multi roll move condition
export const createTurnConditionRollActions = async (rule: RuleSchema) => {
  const { gameStore, actionStore } = rootStore;
  const actions: AlertAction[] = [];

  actions.push(...ActionStore.createNDiceRollActionObjects({
    n: rule.condition!.diceRolls?.numRequired || 1,
    ruleId: rule.id,
    playerId: gameStore.game.currentPlayerId,
    status: ActionStatus.dependent,
  }));

  actionStore.createNewActions(actions);
};

const ApplyMoveConditionRule: RuleHandler = async (rule: RuleSchema) => {
  const { playerStore, alertStore, gameStore, actionStore } = rootStore;

  if (!validateRequired(rule.condition)) {
    console.error('condition is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  const { playerTarget } = rule;
  const actions: AlertAction[] = [];

  if (playerTarget === PlayerTarget.custom) {
    actions.push({
      id: createId('action'),
      ruleId: rule.id,
      type: ActionType.playerSelection,
      status: ActionStatus.ready,
      playerId: gameStore.game.currentPlayerId,
      value: null,
      candidateIds: gameStore.otherPlayerIds
    });
  } else {
    const playerIds = (playerTarget === PlayerTarget.allOthers ?
      gameStore.otherPlayerIds : [gameStore.game.currentPlayerId]);
    playerIds.forEach(async (playerId: string) => {
      await playerStore.updateEffects(playerId, {
        moveCondition: {
          ruleId: rule.id,
          numCurrentSuccesses: 0,
        }
      });
    });
  }

  // Should only be used with self target
  if (rule.condition?.immediate) {
    actions.push(...ActionStore.createNDiceRollActionObjects({
      n: rule.condition.diceRolls?.numRequired || 1,
      ruleId: rule.id,
      playerId: gameStore.game.currentPlayerId,
      status: ActionStatus.dependent,
    }));
  }

  if (actions.length) {
    actionStore.createNewActions(actions);
  } else {
    alertStore.update({ state: AlertState.CAN_CLOSE });
  }
};
ApplyMoveConditionRule.postActionHandler = async (rule: RuleSchema, actions: AlertAction[]) => {
  const { playerStore, alertStore, gameStore } = rootStore;
  const isDone = actions.every(a => !!a.value);

  if (isDone) {
    if (rule.condition?.immediate) {
      // TODO - Currently this is only supported with self targets, but if that ever changes
      // this should be updated to account for there being player selection actions here
      const rolls = actions.map(a => a.value);

      const moveResult: MoveConditionResult = await canPlayerMove(
        gameStore.game.currentPlayerId,
        rule.condition,
        rolls
      );

      // For multi rolls (turn conditions)
      if (rule.condition && rule.condition.diceRolls && rule.condition.diceRolls.numRequired > 1) {
        if (gameStore.game.state === GameState.RULE_TRIGGER) {
          /**
           * (Meaning the success was achieved on the first try)
           *
           * Either if they succeeded or failed, allow the modal to be closed and the turn to end.
           * - If they succeeded, they will take their next turn normally.
           * - If they failed, they will still have the move condition attached and will be forced to reroll
           * upon their next turn starting.
           *
           * Next game state is (by default) RULE_END which is what we want here.
           */
          await alertStore.update({
            state: AlertState.CAN_CLOSE,
            messageOverride: moveResult.message,
          });
        } else if (gameStore.game.state === GameState.TURN_MULTIROLL_CONDITION_CHECK) {
          /**
           * If they succeeded, allow them to take their turn normally.
           * If they failed, their turn is over.
           */
          const nextGameState = moveResult.canMove ? GameState.ROLL_START : GameState.TURN_END;

          await alertStore.update({
            nextGameState,
            state: AlertState.CAN_CLOSE,
            messageOverride: moveResult.message,
          });
        }
      }
    } else {
      // Player is selected, add effects. There should only be one action here
      const playerId = actions[0].value;
      await playerStore.updateEffects(playerId, {
        moveCondition: {
          ruleId: rule.id,
          numCurrentSuccesses: 0,
        }
      });
    }

    alertStore.update({ state: AlertState.CAN_CLOSE });
  }
};

export default ApplyMoveConditionRule;