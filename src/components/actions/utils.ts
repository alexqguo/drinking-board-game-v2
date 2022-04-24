import { AlertAction, ActionStatus, Player, RuleSchema } from "src/types";

/**
 * The action is disabled if:
 * - It was already completed
 * - It's for a different player
 * - The action is a dependent action and prior actions are not completed yet
 */
export const isActionDisabled = (action: AlertAction, actions: AlertAction[], isMyTurn: boolean) => {
  if (!isMyTurn || !!action.value) return true;

  const curIndex = actions.indexOf(action);
  const priorActionsIncomplete = actions.some((a, idx) => idx < curIndex && !a.value);
  const isBlocked = action.status === ActionStatus.dependent && priorActionsIncomplete;

  return isBlocked;
};

export interface ActionProps {
  action: AlertAction,
  actions: AlertAction[],
  isMyTurn: boolean,
  players: Map<string, Player>,
  rule: RuleSchema | null,
  localPlayerId: string,
}