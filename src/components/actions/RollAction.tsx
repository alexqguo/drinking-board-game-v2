import React from 'react';
import DiceRoll from 'src/components/DiceRoll';
import { uiActions } from 'src/engine/game';
import { ActionProps, isActionDisabled } from './utils';

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
  const isDisabled = isActionDisabled(action, actions, isMyTurn);
  const rollValue = action.value ? [action.value] : [];

  return (
    <DiceRoll
      numRolls={1}
      rolls={rollValue}
      disabled={isDisabled}
      onRoll={(rolls: number[]) => { uiActions.handleActionRoll(rolls[0], action) }}
    />
  )
};

export default RollAction;