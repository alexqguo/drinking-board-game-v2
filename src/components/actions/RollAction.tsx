import React from 'react';
import { ActionStatus, AlertAction } from 'src/types';
import DiceRoll from 'src/components/DiceRoll';
import { uiActions } from 'src/engine/game';

interface ActionProps {
  action: AlertAction,
  actions: AlertAction[],
  isMyTurn: boolean,
};

/**
 * Handles dice roll actions in the alert. This is technically a controlled component, but with
 * Firebase as the control. Which is bad, but the latency seems low enough to make it more or less work,
 * at least for now.
 *
 * If it becomes laggy, I'll add in a local state as well that will get overwritten by firebase which can
 * also disable the button.
 *
 * This handles a single roll.
 */
const RollAction = ({
  action,
  actions,
  isMyTurn,
}: ActionProps) => {
  /**
   * The action is disabled if:
   * - It was already completed
   * - It's for a different player
   * - The action is a dependent action and prior actions are not completed yet
   */
  const curIndex = actions.indexOf(action);
  const priorActionsIncomplete = actions.some((a, idx) => idx < curIndex && !a.value);
  const isBlocked = action.status === ActionStatus.dependent && priorActionsIncomplete;
  const isDisabled = !isMyTurn || !!action.value || isBlocked;
  const rollValue = action.value ? [action.value] : [];

  return (
    <>
      <DiceRoll
        numRolls={1}
        rolls={rollValue}
        disabled={isDisabled}
        onRoll={(rolls: number[]) => { uiActions.handleActionRoll(rolls[0], action) }}
      />
      {JSON.stringify(action)}
    </>
  )
};

export default RollAction;