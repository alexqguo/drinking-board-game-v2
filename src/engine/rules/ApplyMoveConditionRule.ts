import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState, AlertDiceRollInfo, MoveConditionSchema, DiceRollType } from 'src/types';
import { requirePlayerSelection } from 'src/engine/alert';
import { validateRequired } from 'src/engine/rules';

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

const canPlayerMove = (playerId: string, conditionTileIndex: number, rolls: number[]) => {
  const { playerStore, boardStore } = rootStore;
  const condition: MoveConditionSchema | undefined = boardStore.schema.tiles[conditionTileIndex].rule.condition;
  if (!condition) return true;

  const isSuccessfulRoll = isDiceRollSuccessful(condition, rolls);
  if (!isSuccessfulRoll) {

  }

  const player = playerStore.players.get(playerId)!;
}

const ApplyMoveConditionRule: RuleHandler = async (rule: RuleSchema) => {
  const { playerStore, boardStore, alertStore } = rootStore;

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
  
  alertStore.update({ state: AlertState.CAN_CLOSE });
};

export default ApplyMoveConditionRule;