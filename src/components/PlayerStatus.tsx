import React, { useContext, useState } from 'react';
import { useObserver } from 'mobx-react';
import {
  Pane,
  Heading,
  Button,
  Paragraph,
  UnorderedList,
  ListItem,
  CaretRightIcon,
} from 'evergreen-ui';
import { Player, GameState, GameType } from 'src/types';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { StoreContext } from 'src/providers/StoreProvider';
import DiceRoll from 'src/components/DiceRoll';
import PlayerEffects from 'src/components/PlayerEffects';
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
      <Heading marginBottom={8}>{player.name}</Heading>
      <PlayerEffects />
      <DiceRoll
        rolls={rolls}
        disabled={!isActionable}
        onRoll={onRoll}
        marginRight={8}
      />
      <Button
        disabled={!isActionable}
        iconBefore="disable"
        onClick={uiActions.skipTurn}
      >
        {i18n.playerStatus.skip}
      </Button>

      <UnorderedList listStyle="none" size={300} marginTop={16}>
        {playerStore.ids.map((id: string) => (
          <ListItem
            margin="0"
            color="muted"
            icon={id === gameStore.game.currentPlayerId ? CaretRightIcon : null}
          >
            {playerStore.players.get(id)!.name}
          </ListItem>
        ))}
      </UnorderedList>

      <Paragraph size={300} marginTop={8}>
        <a href={`/#/join/${gameStore.game.id}`} target="_blank" rel="noreferrer">
          {gameStore.game.id}
        </a>
      </Paragraph>
      {/* list all players, highlight active, maybe just for remote games */}
    </Pane>
  ));
}