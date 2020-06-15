import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Badge } from 'evergreen-ui';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { StoreContext } from 'src/providers/StoreProvider';
import { PlayerEffects } from 'src/types';

export default () => {
  const i18n = useContext(TranslationContext);
  const { gameStore, playerStore } = useContext(StoreContext);
  const effects: PlayerEffects = playerStore.players.get(gameStore.playerStatusId)?.effects!;

  return useObserver(() => (
    <div>
      {effects.extraTurns ? <Badge color="green">{i18n.playerStatus.extraTurn}</Badge> : null}
    </div>
  ));
};