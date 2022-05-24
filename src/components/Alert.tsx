import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import {
  Title,
  Text,
  Button,
  Modal,
  Container,
  SharedTextProps,
} from '@mantine/core';
import { TranslationContext, formatString } from 'src/providers/TranslationProvider';
import { StoreContext } from 'src/providers/StoreProvider';
import AlertActions from 'src/components/AlertActions';
import { uiActions } from 'src/engine/game';
import { AlertState } from 'src/types';

const displayTextProps: SharedTextProps = {
  sx: {
    fontSize: 24,
  }
};

export default () => {
  const rootStore = useContext(StoreContext);
  const { gameStore, playerStore, boardStore, alertStore } = rootStore;
  const { alert } = alertStore;

  const i18n = useContext(TranslationContext);
  const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
  const rule = boardStore.rulesById.get(alert.ruleId);

  return useObserver(() => {
    const { alert } = alertStore;
    let activeRule = rule;

    if (alert.outcomeIdentifier) {
      const identifiers = alert.outcomeIdentifier.split('|');
      identifiers.forEach((identifier: string) => { // don't look
        const [type, idxIdent] = identifier.split(':');
        if (!(type === 'choice' || type === 'outcome')) return;
        const idx = Number(idxIdent);
        const baseSubPath = type === 'choice' ? activeRule?.choices : activeRule?.diceRolls?.outcomes;
        activeRule = baseSubPath![idx].rule;
      });
    }

    const header = <Title order={2}>{alert.headingOverride || currentPlayer.name}</Title>;
    const footer = (
      <Container px={0} mt="md" sx={{ float: 'right' }}>
        {gameStore.isMyTurn ? (
          <Button
            disabled={alertStore.alert.state !== AlertState.CAN_CLOSE}
            onClick={() => uiActions.alertClose(alert.nextGameState)}
          >
            {i18n.alert.done}
          </Button>
        ) : (
          <Text color="gray" size="sm">
            <em>{formatString(i18n.alert.waiting, { playerName: currentPlayer.name })}</em>
          </Text>
        )}
      </Container>
    );

    const modalProps = {
      size: 700,
      opened: alert.open,
      withCloseButton: false,
      closeOnEscape: false,
      closeOnClickOutside: false,
      title: header,
      onClose: () => {}, // Handled by firebase state
    };

    return (
      <Modal {...modalProps}>
        {rule ? <>
          <Text component="p" {...(activeRule && activeRule !== rule ? {} : displayTextProps)}>
            {/* TODO - split on \n here if necessary */}
            {rule.displayText}
          </Text>
        </> : null}

        {alert.messageOverride ?
          <Text component="p" {...displayTextProps}>
            {alert.messageOverride}
          </Text>
        : null}

        {activeRule && activeRule !== rule ? <>
          <Text component="p" {...displayTextProps}>
            {activeRule.displayText}
          </Text>
        </> : null}

        <AlertActions />
        {footer}
      </Modal>
    );
  });
}