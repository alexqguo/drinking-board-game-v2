import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState, SpeedModifier, ModifierOperation } from 'src/types';
import { validateRequiredFields } from 'src/engine/rules';
import { requirePlayerSelection } from '../alert';

const SpeedModifierRule: RuleHandler = async (rule: RuleSchema) => {
  const { numTurns, playerTarget, modifier } = rule;
  const { alertStore, playerStore } = rootStore;

  if (!validateRequiredFields(numTurns, playerTarget, modifier)) {
    console.error('numTurns, playerTarget and modifier are required fields', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  const playerIds = await requirePlayerSelection(playerTarget!);
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