import React, { useContext, useState } from 'react';
import { useObserver } from 'mobx-react';
import { Dialog, Heading } from 'evergreen-ui';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { StoreContext } from 'src/providers/StoreProvider';

export default () => {
  const { gameStore, playerStore, alertStore } = useContext(StoreContext);
  const i18n = useContext(TranslationContext);
  const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId);
  if (!currentPlayer) return null;

  return useObserver(() => (
    <Dialog
      isShown={alertStore.alert.open}
      header={<Heading size={600}>{currentPlayer.name}</Heading>}
      hasCancel={false}
      width={700}
      confirmLabel={i18n.alert.done}
      isConfirmDisabled={!gameStore.isMyTurn /* AND the rule is done */}
    >
      This is some text
    </Dialog>
  ));
}