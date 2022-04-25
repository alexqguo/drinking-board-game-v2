import React from 'react';
import { Pane, Button } from 'evergreen-ui';
import { ActionProps, isActionDisabled } from './utils';
import { uiActions } from 'src/engine/game';

const ChoiceAction = ({
  rule,
  action,
  actions,
  isMyAction,
}: ActionProps) => {
  const isDisabled = isActionDisabled(action, actions, isMyAction);
  const choices = rule!.choices!;

  return (
    <Pane>
      {/* ID is the choice index in this case */}
      {action.candidateIds?.map((id: string) => (
        <Button
          key={id}
          height={24}
          marginRight={8}
          disabled={isDisabled}
          onClick={() => uiActions.handleActionSelection(id, action)}
          iconAfter={!!action.value && id === action.value ? 'tick-circle' : false}
        >
          {choices[Number(id)].rule.displayText}
        </Button>
      ))}
    </Pane>
  );
};

export default ChoiceAction;