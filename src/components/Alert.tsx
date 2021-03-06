import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Dialog, Heading, Paragraph, Button } from 'evergreen-ui';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { StoreContext } from 'src/providers/StoreProvider';
import DiceRoll from 'src/components/DiceRoll';
import { uiActions } from 'src/engine/game';
import { AlertState, AlertRuleType } from 'src/types';

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
  const { schema } = boardStore;
  const { zones, tiles } = schema;

  const i18n = useContext(TranslationContext);
  const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
  const currentTile = alert.ruleType === AlertRuleType.zone ? zones[alert.ruleIdx] : tiles[alert.ruleIdx];
  const rule = currentTile ? currentTile.rule : null;

  return useObserver(() => {
    const { alert } = alertStore;
    const hasDiceRoll = !!alert.diceRolls;
    const hasPlayerSelection = alert.playerSelection.isRequired;
    const hasChoice = !!alert.choice;
    const isChoiceDone = hasChoice && Object.keys(alert.choice).some((k: string) => alert.choice[k].isSelected);
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
    const footer = (
      <Button
        appearance="primary" 
        disabled={alertStore.alert.state !== AlertState.CAN_CLOSE || !gameStore.isMyTurn}
        onClick={() => uiActions.alertClose(alert.nextGameState)}
      >
        {i18n.alert.done}
      </Button>
    );

    const dialogProps = {
      header,
      footer,
      width: 700,
      isShown: alert.open,
      shouldCloseOnEscapePress: false,
      shouldCloseOnOverlayClick: false,
      confirmLabel: i18n.alert.done,
    };

    if (alert.customComponent) {
      dialogProps.footer = <></>;
    }

    return (
    <Dialog {...dialogProps} >
      {alert.customComponent ? <>
        {rootStore.extension?.components[alert.customComponent]()}
      </> : null}

      {rule ? <>
        <Paragraph style={activeRule && activeRule !== rule ? null: displayTextStyles}>
          {/* TODO - split on \n here if necessary */}
          {rule.displayText}
        </Paragraph>
      </>: null}

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

      {hasDiceRoll ? <Paragraph>
        {Object.keys(alert.diceRolls).map((key: string) => (
          <DiceRoll
            key={key}
            marginRight={16}
            disabled={!gameStore.isMyTurn || !!alert.diceRolls[key].result}
            numRolls={alert.diceRolls[key].numRolls}
            rolls={normalizeRolls(alert.diceRolls[key].result)}
            onRoll={(rolls) => uiActions.handleAlertRoll(key, rolls)} 
          />
        ))}
      </Paragraph> : null}

      {hasPlayerSelection ? <Paragraph>
        {alert.playerSelection.candidateIds.map((id: string) =>
          <Button
            key={id}
            height={24}
            marginRight={16}
            onClick={() => uiActions.handleAlertPlayerSelection(id)}
            iconAfter={id === alert.playerSelection.selectedId ? 'tick-circle' : false}
            disabled={!gameStore.isMyTurn || !!alert.playerSelection.selectedId}
          >
            {playerStore.players.get(id)!.name}
          </Button>
        )}
      </Paragraph> : null}

      {hasChoice ? <Paragraph>
        {Object.keys(alert.choice).map((choiceId: string) => (
          <Button
            key={choiceId}
            height={24}
            marginRight={16}
            disabled={!gameStore.isMyTurn || isChoiceDone}
            onClick={() => uiActions.handleAlertChoice(choiceId)}
            iconAfter={alert.choice[choiceId].isSelected ? 'tick-circle' : false}
          >
            {alert.choice[choiceId].displayText}
          </Button>
        ))}
      </Paragraph> : null}
    </Dialog> 
    );
  });
}