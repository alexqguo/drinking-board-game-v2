import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState, AlertAction, ActionType, ActionStatus } from 'src/types';
import { createId } from 'src/utils';

const GroupRollRule: RuleHandler = async (rule: RuleSchema) => {
  const { actionStore, playerStore } = rootStore;

  const playerIds = Array.from(playerStore.players.keys());
  const actions: AlertAction[] = playerIds.reduce((acc: AlertAction[], cur: string) => {
    acc.push({
      id: createId('action'),
      ruleId: rule.id,
      playerId: cur,
      type: ActionType.roll,
      status: ActionStatus.ready,
      value: null,
    });

    return acc;
  }, []);

  actionStore.createNewActions(actions);
};

GroupRollRule.postActionHandler = (rule: RuleSchema, actions: AlertAction[]) => {
  const { alertStore } = rootStore;
  const isDone = actions.every(a => !!a.value);

  if (isDone) {
    alertStore.update({ state: AlertState.CAN_CLOSE });
  }
};

export default GroupRollRule;