import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Badge } from 'evergreen-ui';
import { TranslationContext, formatString } from 'src/providers/TranslationProvider';
import { StoreContext } from 'src/providers/StoreProvider';
import { PlayerEffects } from 'src/types';

export default () => {
  const i18n = useContext(TranslationContext);
  const { playerStatus } = i18n;
  const { gameStore, playerStore, boardStore } = useContext(StoreContext);
  const effects: PlayerEffects = playerStore.players.get(gameStore.playerStatusId)?.effects!;

  return useObserver(() => (
    <div>
      {effects.extraTurns ? <Badge color="blue">{playerStatus.extraTurn}</Badge> : null}
      {effects.skippedTurns.numTurns ? <Badge color="red">{playerStatus.missedTurn}</Badge> : null}
      {effects.mandatorySkips ? <Badge color="blue">{playerStatus.skipMandatory}</Badge> : null}
      {effects.speedModifier.numTurns ? 
        <Badge color="blue">{effects.speedModifier.operation}{effects.speedModifier.modifier}</Badge> 
      : null}
      {effects.customMandatoryTileIndex > -1 ? 
        <Badge color="blue">
          {formatString(playerStatus.customMandatory, { idx: `${effects.customMandatoryTileIndex}` })}
        </Badge>
      : null}
      {effects.moveCondition.tileIndex > -1 ? 
        <Badge color="blue">
          {boardStore.schema.tiles[effects.moveCondition.tileIndex].rule.condition?.description}
        </Badge>
      : null}
    </div>
  ));
};