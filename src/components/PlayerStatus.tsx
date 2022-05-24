import React, { useContext, useState } from 'react';
import { useObserver } from 'mobx-react';
import {
  Button,
  Text,
  Title,
  List,
  Paper,
} from '@mantine/core';
import { FaBan, FaCaretRight } from 'react-icons/fa';
import { Player, GameState, GameType } from 'src/types';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { StoreContext } from 'src/providers/StoreProvider';
import DiceRoll from 'src/components/DiceRoll';
import PlayerEffects from 'src/components/PlayerEffects';
import { getAdjustedRoll } from 'src/engine/rules/SpeedModifierRule';
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

  const onRollAugment = (rolls: number[]) => {
    const newRoll = getAdjustedRoll(rolls[0], player.effects.rollAugmentation);
    uiActions.handleRollAugmentation(newRoll, player.id);
    setRolls([newRoll]);
  }

  if (isActionable && rolls.length) setRolls([]);
  return useObserver(() => (
    <Paper
      p="md"
      shadow="md"
      radius="xs"
      withBorder
      sx={{
        width: 215,
        minHeight: 100,
        backgroundColor: 'white',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 99, // evergreen(?) overlay has z-index of 20
      }}
    >
      <Title order={4} mb="sm">
        {player.name}
      </Title>

      <PlayerEffects />

      {gameStore.isMyTurn && (
        <>
          <DiceRoll
            rolls={rolls}
            disabled={!isActionable}
            onRoll={onRoll}
            mr="xs"
            mb="xs"
          />
          {!!player.effects.rollAugmentation.numTurns && (
            <DiceRoll
              rolls={rolls}
              disabled={!isActionable}
              onRoll={onRollAugment}
              mr="xs"
              mb="xs"
            >
              {player.effects.rollAugmentation.operation}
              {player.effects.rollAugmentation.modifier}
            </DiceRoll>
          )}
          <Button
            disabled={!isActionable}
            onClick={uiActions.skipTurn}
            leftIcon={<FaBan />}
            color="orange"
            size="xs"
            mb="sm"
          >
            {i18n.playerStatus.skip}
          </Button>
        </>
      )}

      <List size="xs" mt="md" sx={{ listStyleType: 'none' }}>
        {playerStore.ids.map((id: string) => (
          <List.Item
            key={id}
            m="0"
            color="muted"
            icon={id === gameStore.game.currentPlayerId ? <FaCaretRight /> : null}
          >
            {playerStore.players.get(id)!.name}
          </List.Item>
        ))}
      </List>

      {gameStore.game.type === GameType.remote ? (
        <Text component="p" size="xs" mt="sm">
          <a href={`/#/join/${gameStore.game.id}`} target="_blank" rel="noreferrer">
            {gameStore.game.id}
          </a>
        </Text>
      ) : null}
    </Paper>
  ));
}