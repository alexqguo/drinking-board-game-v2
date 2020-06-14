import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Pane, Heading, Button, Text } from 'evergreen-ui';
import { Player, GameState } from 'src/types';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { StoreContext } from 'src/providers/StoreProvider';
import DiceRoll from 'src/components/DiceRoll';

export default () => {
  const i18n = useContext(TranslationContext);
  const { gameStore, playerStore } = useContext(StoreContext);
  const player: Player = playerStore.players.get(gameStore.playerStatusId)!;
  const isActionable = gameStore.isMyTurn && gameStore.game.state === GameState.ROLL_START;
  
  const skipTurn = () => gameStore.setGameState(GameState.TURN_SKIP);
  const onRoll = (rolls: number[], reset: Function) => {
    console.log(rolls, reset);
  };

  return useObserver(() => (
    <Pane
      width={220}
      minHeight={100}
      padding={20}
      elevation={1}
      backgroundColor="white"
      position="absolute"
      top={0}
      left={0}
    >
      <Heading>{player.name}</Heading>
      <DiceRoll disabled={!isActionable} onRoll={onRoll} />
      <Button 
        disabled={!isActionable}
        iconBefore="disable"
        onClick={skipTurn}
      >
        {i18n.playerStatus.skip}
      </Button>

      <Text size={300}>{gameStore.game.id}</Text>
      {/* list all players, highlight active, maybe just for remote games */}
    </Pane>
  ));
}