import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Dialog, Heading, Paragraph, Button } from 'evergreen-ui';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { StoreContext } from 'src/providers/StoreProvider';
import DiceRoll from 'src/components/DiceRoll';
import { uiActions } from 'src/engine/game';
import { AlertState } from 'src/types';

const normalizeRolls = (input: string): number[] => {
  if (!input) return [];
  return input.split('|').map(x => Number(x));
};

export default () => {
  const { gameStore, playerStore, boardStore, alertStore } = useContext(StoreContext);
  const i18n = useContext(TranslationContext);
  const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
  const currentTile = boardStore.boardSchema.tiles[alertStore.alert.ruleIdx];
  const rule = currentTile ? currentTile.rule : null;

  // { close } provided by evergreen-ui, not sure what its type is
  const footer = ({ close }: any) => (
    <Button
      appearance="primary" 
      disabled={alertStore.alert.state !== AlertState.CAN_CLOSE || !gameStore.isMyTurn}
      onClick={close}
    >
      {i18n.alert.done}
    </Button>
  );

  return useObserver(() => (
    <Dialog
      isShown={alertStore.alert.open}
      header={<Heading size={800}>{currentPlayer ? currentPlayer.name : ''}</Heading>}
      footer={footer}
      width={700}
      confirmLabel={i18n.alert.done}
      onCloseComplete={uiActions.alertClose}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEscapePress={false}
    >
      {rule ? 
        <section>
          <Paragraph style={{ lineHeight: '32px', fontSize: 24 }}>
            {rule.displayText}
          </Paragraph>

          <Paragraph>
            {Object.keys(alertStore.alert.diceRolls).map((key: string) => (
              <DiceRoll
                key={key}
                disabled={!gameStore.isMyTurn || !!alertStore.alert.diceRolls[key].result}
                numRolls={alertStore.alert.diceRolls[key].numRolls}
                rolls={normalizeRolls(alertStore.alert.diceRolls[key].result)}
                onRoll={(rolls) => uiActions.handleAlertRoll(key, rolls)} 
              />
            ))}
          </Paragraph>
        </section>
      : <></>}
    </Dialog> 
  ));
}