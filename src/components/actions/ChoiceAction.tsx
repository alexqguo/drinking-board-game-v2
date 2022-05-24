import React from 'react';
import { FaRegCheckCircle } from 'react-icons/fa';
import {
  Button,
  Container,
} from '@mantine/core';
import { ActionProps, isActionDisabled } from './utils';
import { uiActions } from 'src/engine/game';

const ChoiceAction = ({
  rule,
  action,
  actions,
  isMyAction,
}: ActionProps) => {
  const isDisabled = isActionDisabled(action, actions, isMyAction);
  const choices = rule?.choices!;
  // Shitty fix for race condition in remote games when clearing the alert/actions together
  if (!choices) return null;

  return (
    <Container px={0}>
      {/* ID is the choice index in this case */}
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
          {choices[Number(id)].rule.displayText}
        </Button>
      ))}
    </Container>
  );
};

export default ChoiceAction;