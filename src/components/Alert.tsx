import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Dialog, Heading, Paragraph } from 'evergreen-ui';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { StoreContext } from 'src/providers/StoreProvider';
import { uiActions } from 'src/engine/game';

export default () => {
  const { gameStore, playerStore, boardStore, alertStore } = useContext(StoreContext);
  const i18n = useContext(TranslationContext);
  const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
  const currentTile = boardStore.boardSchema.tiles[alertStore.alert.ruleIdx];
  const rule = currentTile ? currentTile.rule : null;

  console.log('asdf')
  return useObserver(() => (
    <Dialog
      isShown={alertStore.alert.open}
      header={<Heading size={800}>{currentPlayer ? currentPlayer.name : ''}</Heading>}
      hasFooter={alertStore.alert.canClose}
      width={700}
      confirmLabel={i18n.alert.done}
      isConfirmDisabled={!gameStore.isMyTurn /* AND the rule is done */}
      onCloseComplete={uiActions.alertClose}
    >
      {rule ? 
        <Paragraph size={500}>{rule.displayText}</Paragraph>
      : <></>}
    </Dialog> 
  ));
}