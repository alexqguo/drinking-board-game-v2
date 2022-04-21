import React from 'react';
import { Text,Button, Paragraph } from 'evergreen-ui'
import { uiActions } from 'src/engine/game';
import { ActionProps, isActionDisabled } from './utils';

const PlayerSelectAction = ({
  action,
  actions,
  isMyTurn,
  players,
}: ActionProps) => {
  const isDisabled = isActionDisabled(action, actions, isMyTurn);

  return (
    <Paragraph>
      <Text marginRight={8}>Choose a player:</Text>
      {action.candidateIds?.map((id: string) => (
        <Button
          key={id}
          height={24}
          marginRight={8}
          disabled={isDisabled}
          onClick={() => uiActions.handleActionSelection(id, action)}
          iconAfter={!!action.value && id === action.value ? 'tick-circle' : false}
        >
          {players.get(id)?.name}
        </Button>
      ))}
      {JSON.stringify(action)}
    </Paragraph>
  );
};

export default PlayerSelectAction;