import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Dialog, Heading, Paragraph, Button, Text } from 'evergreen-ui';
import { TranslationContext, formatString } from 'src/providers/TranslationProvider';
import { StoreContext } from 'src/providers/StoreProvider';
import DiceRoll from 'src/components/DiceRoll';
import AlertActions from 'src/components/AlertActions';
import { uiActions } from 'src/engine/game';
import { AlertState } from 'src/types';

const displayTextStyles = {
  lineHeight: '32px',
  fontSize: 24,
};

const normalizeRolls = (input: string): number[] => {
  if (!input) return [];
  return input.split('|').map(x => Number(x));
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

    const header = <Heading size={800}>{alert.headingOverride || currentPlayer.name}</Heading>;
    const footer = gameStore.isMyTurn ? (
      <Button
        appearance="primary"
        disabled={alertStore.alert.state !== AlertState.CAN_CLOSE}
        onClick={() => uiActions.alertClose(alert.nextGameState)}
      >
        {i18n.alert.done}
      </Button>
    ) : (
      <Text color="muted" size={300}>
        <em>{formatString(i18n.alert.waiting, { playerName: currentPlayer.name })}</em>
      </Text>
    );

    const dialogProps = {
      header,
      footer,
      width: 700,
      isShown: alert.open,
      topOffset: 100,
      shouldCloseOnEscapePress: false,
      shouldCloseOnOverlayClick: false,
      confirmLabel: i18n.alert.done,
    };

    return (
    <Dialog {...dialogProps}>
      {rule ? <>
        <Paragraph style={activeRule && activeRule !== rule ? undefined : displayTextStyles}>
          {/* TODO - split on \n here if necessary */}
          {rule.displayText}
        </Paragraph>
      </> : null}

      {alert.messageOverride ?
        <Paragraph style={displayTextStyles}>
          {alert.messageOverride}
        </Paragraph>
      : null}

      {activeRule && activeRule !== rule ? <>
        <Paragraph style={displayTextStyles}>
          {activeRule.displayText}
        </Paragraph>
      </> : null}

      <AlertActions />
    </Dialog>
    );
  });
}