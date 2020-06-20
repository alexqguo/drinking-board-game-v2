import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState } from 'src/types';
import { validateRequiredFields } from 'src/engine/rules';
import { requireDiceRolls } from '../alert';

const RollUntilRule: RuleHandler = (rule: RuleSchema) => {
  const { playerStore, gameStore, alertStore } = rootStore;

  if (!validateRequiredFields(rule.criteria) || rule.criteria!.length < 1) {
    console.error('criteria is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  const rollUntilFn = async () => {
    const rolls = await requireDiceRolls(1);
    const size = Object.keys(rolls).length;
    const lastRoll = rolls[`roll${size - 1}`].result
      .split('|')
      .map(x => Number(x))[0];

    if (rule.criteria!.indexOf(lastRoll) > -1) {
      alertStore.update({ state: AlertState.CAN_CLOSE });
    } else {
      rollUntilFn();
    }
  }

  rollUntilFn();
};

export default RollUntilRule;