import React from 'react';
import { Pane, Button } from 'evergreen-ui';
import { ActionProps, isActionDisabled } from './utils';
import { uiActions } from 'src/engine/game';

const StarterSelectAction = ({
  rule,
  action,
  actions,
  players,
  isMyTurn,
  localPlayerId,
}: ActionProps) => {
  // Set isMyTurn to true if the action is for the local player. Will always be true in a local game
  // TODO- this is broken, current player can choose for everyone
  const isDisabled = isActionDisabled(action, actions, isMyTurn || action.playerId === localPlayerId);

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