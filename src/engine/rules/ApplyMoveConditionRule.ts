import rootStore from 'src/stores';
import { 
  RuleSchema,
  RuleHandler,
  AlertState,
  MoveConditionSchema,
  DiceRollType,
  MoveConditionResult 
} from 'src/types';
import { requirePlayerSelection, requireDiceRolls, getRollsFromAlertDiceRoll } from 'src/engine/alert';
import { validateRequired } from 'src/engine/rules';
import PlayerStore from 'src/stores/PlayerStore';
import { formatString } from 'src/providers/TranslationProvider';
import en from 'src/i18n/en_US.json';

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
      // TODO - execute the consequence rule
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
  const { playerStore, boardStore, alertStore, gameStore } = rootStore;

  if (!validateRequired(rule.condition)) {
    console.error('condition is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  const playerIds = await requirePlayerSelection(rule.playerTarget!);
  playerIds.forEach((playerId: string) => {
    playerStore.updateEffects(playerId, {
      moveCondition: {
        tileIndex: boardStore.getTileIndexForRule(rule),
        numCurrentSuccesses: 0,
      }
    });
  });
  
  // TODO - do dice rolls now if condition.immediate
  // Should only be used with self target
  if (rule.condition?.immediate) {
    const rolls = await requireDiceRolls(rule.condition.diceRolls?.numRequired || 1);
    canPlayerMove(gameStore.game.currentPlayerId, rule.condition, getRollsFromAlertDiceRoll(rolls));
  }

  alertStore.update({ state: AlertState.CAN_CLOSE });
};

export default ApplyMoveConditionRule;