import rootStore from 'src/stores';
import {
  RuleSchema,
  RuleHandler,
  AlertState,
  SpeedModifier,
  ModifierOperation,
  PlayerTarget,
  AlertAction,
  ActionType,
  ActionStatus,
} from 'src/types';
import { validateRequired } from 'src/engine/rules';
import { createId } from 'src/utils';

const SpeedModifierRule: RuleHandler = async (rule: RuleSchema) => {
  const { numTurns, playerTarget, modifier } = rule;
  const { alertStore, actionStore, gameStore } = rootStore;

  if (!validateRequired(numTurns, playerTarget, modifier)) {
    console.error('numTurns, playerTarget and modifier are required fields', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  if (playerTarget === PlayerTarget.self) {
    setEffects([gameStore.game.currentPlayerId], rule);
  } else if (playerTarget === PlayerTarget.allOthers) {
    setEffects(gameStore.otherPlayerIds, rule)
  } else {
    const action: AlertAction = {
      id: createId('action'),
      playerId: gameStore.game.currentPlayerId,
      type: ActionType.playerSelection,
      status: ActionStatus.ready,
      value: null,
      candidateIds: gameStore.otherPlayerIds,
    };
    await actionStore.createNewActions([action]);
  }
};
SpeedModifierRule.postActionHandler = (rule: RuleSchema, actions: AlertAction[]) => {
  const { alertStore } = rootStore;
  const isDone = !!actions[0].value;

  if (isDone) {
    setEffects([actions[0].value], rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
  }
};

const setEffects = (playerIds: string[], rule: RuleSchema) => {
  const { playerStore, alertStore } = rootStore;
  const { numTurns, modifier } = rule;

  playerIds.forEach((id: string) => {
    playerStore.updateEffects(id, {
      speedModifier: {
        numTurns: numTurns!,
        operation: modifier![0],
        modifier: modifier![1],
      }
    });
  });
  alertStore.update({ state: AlertState.CAN_CLOSE });
};

export const getAdjustedRoll = (originalRoll: number, mod: SpeedModifier): number => {
  const { operation, modifier } = mod;

  switch (operation) {
    case ModifierOperation.addition:
      return originalRoll + modifier;

    case ModifierOperation.subtraction:
      return originalRoll - modifier;

    case ModifierOperation.multiplication:
      return Math.ceil(originalRoll * modifier);

    case ModifierOperation.equal:
    default:
      return originalRoll;
  }
}

export default SpeedModifierRule;