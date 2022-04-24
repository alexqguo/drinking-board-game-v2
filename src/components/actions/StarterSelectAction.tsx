import React from 'react';
import { Paragraph, Button } from 'evergreen-ui';
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
  const isDisabled = isActionDisabled(action, actions, isMyTurn || action.playerId === localPlayerId);

  return (
    <Paragraph marginBottom={16}>
      {players.get(action.playerId)?.name}
      <br />
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
          {rule?.starters![Number(id)]}
        </Button>
      ))}
    </Paragraph>
  );
};

export default StarterSelectAction;