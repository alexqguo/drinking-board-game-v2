import React from 'react';
import { FaRegCheckCircle } from 'react-icons/fa';
import { Container, Button } from '@mantine/core';
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
    <Container px={0}>
      {/* ID is the starter index in this case */}
      {action.candidateIds?.map((id: string) => (
        <Button
          key={id}
          mr="xs"
          size="xs"
          color="gray"
          variant="outline"
          disabled={isDisabled}
          onClick={() => uiActions.handleActionSelection(id, action)}
          rightIcon={!!action.value && id === action.value ? <FaRegCheckCircle /> : null}
        >
          {rule?.starters![Number(id)]}
        </Button>
      ))}
    </Container>
  );
};

export default StarterSelectAction;