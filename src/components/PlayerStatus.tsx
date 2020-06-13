import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Pane, Heading, Button, Text } from 'evergreen-ui';
import { Player, GameState, GameType } from 'src/types';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { StoreContext } from 'src/providers/StoreProvider';

interface Props {
  player: Player
}

export default ({ player }: Props) => {
  const i18n = useContext(TranslationContext);
  const { gameStore } = useContext(StoreContext);
  const isActionable = gameStore.isMyTurn && gameStore.game.state === GameState.ROLL_START;
  console.log(gameStore.isMyTurn);
  console.log(gameStore.game.state, GameState.ROLL_START);

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
      <Button 
        disabled={!isActionable}
        iconBefore="hand-right"
        appearance="primary"
      >
        {i18n.playerStatus.roll}
      </Button>
      <Button 
        disabled={!isActionable}
        iconBefore="disable"
      >
        {i18n.playerStatus.skip}
      </Button>

      <Text size={300}>{gameStore.game.id}</Text>
      {/* list all players, highlight active, maybe just for remote games */}
    </Pane>
  ));
}