import React from 'react';
import { Pane, Button } from 'evergreen-ui';
import { ActionProps, isActionDisabled } from './utils';
import { uiActions } from 'src/engine/game';

const StarterSelectAction = ({
  rule,
  action,
  actions,
  isMyAction,
}: ActionProps) => {
  const isDisabled = isActionDisabled(action, actions, isMyAction);

  return (
    <Pane>
      {/* ID is the starter index in this case */}
      {action.candidateIds?.map((id: string) => (
        <Button
          key={id}
          height={24}
          marginRight={8}
          disabled={isDisabled}
          onClick={() => uiActions.handleActionSelection(id, action)}
          iconAfter={!!action.value && id === action.value ? 'tick-circle' : false}
        >
          {rule?.starters![Number(id)]}
        </Button>
      ))}
    </Pane>
  );
};

export default StarterSelectAction;