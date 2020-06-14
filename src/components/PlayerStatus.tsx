import React, { useContext, useState } from 'react';
import { useObserver } from 'mobx-react';
import { Pane, Heading, Button, Text } from 'evergreen-ui';
import { Player, GameState } from 'src/types';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { StoreContext } from 'src/providers/StoreProvider';
import DiceRoll from 'src/components/DiceRoll';
import { uiActions } from 'src/engine/game';

export default () => {
  const i18n = useContext(TranslationContext);
  const [rolls, setRolls] = useState<number[]>([]);
  const { gameStore, playerStore } = useContext(StoreContext);
  const player: Player = playerStore.players.get(gameStore.playerStatusId)!;
  const isActionable = gameStore.isMyTurn && gameStore.game.state === GameState.ROLL_START && !gameStore.game.currentRoll; // Can you ever roll a 0?
  
  const onRoll = (rolls: number[]) => {
    uiActions.handleRoll(rolls[0]);
    setRolls(rolls);
  };

  if (isActionable && rolls.length) setRolls([]);
  return useObserver(() => (
    <Pane
      width={220}
      minHeight={100}
      padding={20}
      elevation={1}
      backgroundColor="white"
      position="fixed"
      top={0}
      left={0}
    >
      <Heading>{player.name}</Heading>
      <DiceRoll rolls={rolls} disabled={!isActionable} onRoll={onRoll} />
      <Button 
        disabled={!isActionable}
        iconBefore="disable"
        onClick={uiActions.skipTurn}
      >
        {i18n.playerStatus.skip}
      </Button>

      <br />
      <Text size={300}>{gameStore.game.id}</Text>
      {/* list all players, highlight active, maybe just for remote games */}
    </Pane>
  ));
}