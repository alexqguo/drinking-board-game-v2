import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState, AlertAction, ActionStatus, ActionType } from 'src/types';
import { validateRequired } from 'src/engine/rules';
import { createId } from 'src/utils';

const RollUntilRule: RuleHandler = async (rule: RuleSchema) => {
  const { gameStore, alertStore, actionStore } = rootStore;

  if (!validateRequired(rule.criteria) || rule.criteria!.length < 1) {
    console.error('criteria is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  // Create a singular action at first. postActionHandler will add more depending on the results
  const actions = [{
    id: createId('action'),
    playerId: gameStore.game.currentPlayerId,
    status: ActionStatus.ready,
    type: ActionType.roll,
    value: null,
  }];

  await actionStore.createNewActions(actions);
};

RollUntilRule.postActionHandler = (rule: RuleSchema, actions: AlertAction[]) => {
  const { alertStore, actionStore, gameStore } = rootStore;
  const lastAction = actions[actions.length - 1];
  const isDone = rule.criteria!.indexOf(lastAction.value) > -1;

  if (isDone) {
    alertStore.update({ state: AlertState.CAN_CLOSE });
  } else if (!!lastAction.value && rule.criteria!.indexOf(lastAction.value) === -1) {
    actionStore.pushAction({
      id: createId('action'),
      playerId: gameStore.game.currentPlayerId,
      status: ActionStatus.ready,
      type: ActionType.roll,
      value: null,
    });
  }
};

export default RollUntilRule;