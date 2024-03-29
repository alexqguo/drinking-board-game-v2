import rootStore from 'src/stores';
import {
  RuleSchema,
  RuleHandler,
  AlertAction,
  AlertState,
  ActionType,
  ActionStatus
} from 'src/types';
import { validateRequired } from 'src/engine/rules';
import { createId } from 'src/utils';

const StarterSelectionRule: RuleHandler = async (rule: RuleSchema) => {
  const { playerStore, actionStore, alertStore } = rootStore;
  const { starters } = rule;

  if (!validateRequired(starters)) {
    console.error('starters is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  const actions: AlertAction[] = [];
  const starterIndexes: string[] = starters!.map((s: string, i: number) => String(i));

  // Create an action for each player
  playerStore.ids.forEach((id: string) => {
    actions.push({
      id: createId('action'),
      ruleId: rule.id,
      playerId: id,
      status: ActionStatus.ready,
      type: ActionType.starterSelection,
      candidateIds: starterIndexes,
      value: null,
    });
  });

  actionStore.createNewActions(actions);
};
StarterSelectionRule.postActionHandler = (rule: RuleSchema, actions: AlertAction[]) => {
  const { playerStore, alertStore } = rootStore;
  const isDone = actions.every(a => !!a.value);

  if (isDone) {
    // For each action, set the player starter value
    actions.forEach((a: AlertAction) => {
      playerStore.updateEffects(a.playerId, {
        starter: rule.starters![Number(a.value)],
      });
    });

    alertStore.update({ state: AlertState.CAN_CLOSE });
  }
};

export default StarterSelectionRule;