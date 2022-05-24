import React, { useContext } from 'react';
import { FaRegCheckCircle } from 'react-icons/fa';
import {
  Button,
  Text,
} from '@mantine/core';
import { uiActions } from 'src/engine/game';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { ActionProps, isActionDisabled } from './utils';

const PlayerSelectAction = ({
  action,
  actions,
  isMyAction,
  players,
}: ActionProps) => {
  const i18n = useContext(TranslationContext);
  const isDisabled = isActionDisabled(action, actions, isMyAction);

  return (
    <Text component="p">
      <Text mr="sm">{i18n.actions.playerSelection}</Text>
      {action.candidateIds?.map((id: string) => (
        <Button
          key={id}
          mr="xs"
          size="xs"
          color="gray"
          variant="outline"
          disabled={isDisabled}
          onClick={() => uiActions.handleActionSelection(id, action)}
          rightIcon={!!action.value && id === action.value ? <FaRegCheckCircle /> : false}
        >
          {players.get(id)?.name}
        </Button>
      ))}
    </Text>
  );
};

export default PlayerSelectAction;