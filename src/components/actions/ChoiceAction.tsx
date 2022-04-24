import React from 'react';
import { Paragraph, Button } from 'evergreen-ui';
import { ActionProps, isActionDisabled } from './utils';
import { uiActions } from 'src/engine/game';

const ChoiceAction = ({
  rule,
  action,
  actions,
  isMyTurn,
}: ActionProps) => {
  const isDisabled = isActionDisabled(action, actions, isMyTurn);
  const choices = rule!.choices!;

  return (
    <Paragraph>
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
    </Paragraph>
  );
};

export default ChoiceAction;