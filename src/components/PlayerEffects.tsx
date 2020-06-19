import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Badge } from 'evergreen-ui';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { StoreContext } from 'src/providers/StoreProvider';
import { PlayerEffects } from 'src/types';

export default () => {
  const i18n = useContext(TranslationContext);
  const { playerStatus } = i18n;
  const { gameStore, playerStore } = useContext(StoreContext);
  const effects: PlayerEffects = playerStore.players.get(gameStore.playerStatusId)?.effects!;

  return useObserver(() => (
    <div>
      {effects.extraTurns ? <Badge color="green">{playerStatus.extraTurn}</Badge> : null}
      {effects.skippedTurns.numTurns ? <Badge color="red">{playerStatus.missedTurn}</Badge> : null}
      {effects.speedModifier.numTurns ? 
        <Badge color="blue">{effects.speedModifier.operation}{effects.speedModifier.modifier}</Badge> 
      : null}
    </div>
  ));
};