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
  ActionStatus
} from 'src/types';
import { validateRequired } from 'src/engine/rules';
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
      // TODO - execute the consequence rule. Need this for gen 2 zone
      // const handler = getHandlerForRule(condition.consequence);
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

  if (!condition.numSuccessesRequired || newSuccessCount >= condition.numSuccessesRequired) {
    await playerStore.updateEffects(playerId, {
      moveCondition: PlayerStore.defaultEffects().moveCondition,
    });

    return {
      canMove: true,
      message: '', // Game engine will ignore it
    }
  }

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

const ApplyMoveConditionRule: RuleHandler = async (rule: RuleSchema) => {
  const { playerStore, boardStore, alertStore, gameStore, actionStore } = rootStore;

  if (!validateRequired(rule.condition)) {
    console.error('condition is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  console.log('apply move condition rule id', rule);

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
      // TODO- use ruleId instead of tileIndex, update game engine accordingly
      await playerStore.updateEffects(playerId, {
        moveCondition: {
          tileIndex: boardStore.getTileIndexForRule(rule),
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
  const { playerStore, boardStore, alertStore, gameStore } = rootStore;
  const isDone = actions.every(a => !!a.value);

  if (isDone) {
    if (rule.condition?.immediate) {
      // TODO - Currently this is only supported with self targets, but if that ever changes
      // this should be updated to account for there being player selection actions here
      const rolls = actions.map(a => a.value);

      await canPlayerMove(gameStore.game.currentPlayerId, rule.condition, rolls);
    } else {
      // Player is selected, add effects. There should only be one action here
      const playerId = actions[0].value;
      await playerStore.updateEffects(playerId, {
        moveCondition: {
          tileIndex: boardStore.getTileIndexForRule(rule),
          numCurrentSuccesses: 0,
        }
      });
    }

    alertStore.update({ state: AlertState.CAN_CLOSE });
  }
};

export default ApplyMoveConditionRule;