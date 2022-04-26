import React, { useContext } from 'react';
import { Text,Button, Paragraph, TickCircleIcon } from 'evergreen-ui'
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
    <Paragraph>
      <Text marginRight={8}>{i18n.actions.playerSelection}</Text>
      {action.candidateIds?.map((id: string) => (
        <Button
          key={id}
          height={24}
          marginRight={8}
          disabled={isDisabled}
          onClick={() => uiActions.handleActionSelection(id, action)}
          iconAfter={!!action.value && id === action.value ? TickCircleIcon : false}
        >
          {players.get(id)?.name}
        </Button>
      ))}
    </Paragraph>
  );
};

export default PlayerSelectAction;