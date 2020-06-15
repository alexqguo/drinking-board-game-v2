import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Dialog, Heading, Paragraph, Button } from 'evergreen-ui';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { StoreContext } from 'src/providers/StoreProvider';
import { uiActions } from 'src/engine/game';

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
      disabled={!alertStore.alert.canClose || !gameStore.isMyTurn}
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
      isConfirmDisabled={!gameStore.isMyTurn /* AND the rule is done */}
      onCloseComplete={uiActions.alertClose}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEscapePress={false}
    >
      {rule ? 
        <Paragraph style={{ lineHeight: '32px', fontSize: 24 }}>{rule.displayText}</Paragraph>
      : <></>}
    </Dialog> 
  ));
}