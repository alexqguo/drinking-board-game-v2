import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Paper } from '@mantine/core';
import { StoreContext } from 'src/providers/StoreProvider';
import { TranslationContext } from 'src/providers/TranslationProvider';
import ShareGamePopover from 'src/components/ShareGamePopover';
import { GameType } from 'src/types';

export default () => {
  const i18n = useContext(TranslationContext);
  const { gameStore } = useContext(StoreContext);

  return useObserver(() => (
    <Paper
      p="md"
      sx={{
        backgroundColor: 'transparent',
        position: 'fixed',
        bottom: 0,
        left: 0,
        zIndex: 999,
      }}
    >
      {gameStore.game.type === GameType.remote ? (
        <ShareGamePopover gameId={gameStore.game.id} />
      ) : null}
    </Paper>
  ));
};