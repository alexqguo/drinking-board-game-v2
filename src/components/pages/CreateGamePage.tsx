import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Title,
  Text,
  Button,
  Select,
  InputWrapper,
  TextInput,
  CloseButton,
  Container,
  RadioGroup,
  Radio,
} from '@mantine/core';
import useInput from 'src/hooks/useInput';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { GameType, CreateGameOptions } from 'src/types';
import config from 'src/config';
import { StoreContext } from 'src/providers/StoreProvider';
import CenterLayout from 'src/components/CenterLayout';
import Loading from 'src/components/Loading';

interface PlayerData {
  name: string,
}

export default () => {
  const store = useContext(StoreContext);
  const i18n = useContext(TranslationContext);
  const [board, boardBind] = useInput(config.boards[0].value);
  const [createdGameId, setCreatedGameId] = useState('');
  const [players, setPlayers] = useState<PlayerData[]>([{ name: '' }, { name: '' }]);
  const [gameType, gameTypeBind] = useInput(GameType.local);
  const [localPlayer, localPlayerBind] = useInput('');
  const [isLoading, setIsLoading] = useState(false);

  if (createdGameId) return <Redirect to={`/game/${createdGameId}`} />;

  const gameTypeOptions = [
    { label: i18n.createGame.local, value: GameType.local },
    { label: i18n.createGame.remote, value: GameType.remote },
  ];

  const isValidName = (player: PlayerData) => {
    return player.name.length > 0
      && players.some((p: PlayerData) => p.name === player.name);
  }
  const removePlayer = (idx: number) => {
    players.splice(idx, 1);
    setPlayers([...players]);
  };
  const updatePlayer = (key: keyof PlayerData, value: string, i: number) => {
    players[i][key] = value;
    setPlayers([...players]);
  };

  const isReadyToStart = () => {
    const hasBoard: boolean = !!board;
    const isValidGameType: boolean = gameType === GameType.local || gameType === GameType.remote;
    const hasEnoughPlayers: boolean = players.length >= 2;
    const hasValidNames: boolean = players.every(isValidName);
    const hasLocalPlayer: boolean = gameType === GameType.local
      || (!!localPlayer && players.map(p => p.name).indexOf(localPlayer) !== -1);

    return hasBoard && isValidGameType && hasEnoughPlayers && hasValidNames && hasLocalPlayer;
  };

  const validateAndSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isReadyToStart()) return;

    setIsLoading(true);
    const options: CreateGameOptions = {
      board,
      gameType,
      playerNames: players.map((p: PlayerData) => p.name),
      // Only pass localPlayer if it's a remote game
      localPlayer: (gameType === GameType.remote ? localPlayer : undefined),
    };
    const gameId = await store.createGame(options);
    setCreatedGameId(gameId);
  }

  if (isLoading) return <Loading />

  return (
    <CenterLayout>
      <>
        <Title order={1} mb="md">{i18n.createGame.title}</Title>

        <Text component="p" mb="md">
          {i18n.createGame.explanation}
        </Text>

        {/* game */}
        <Select
          value={board}
          label={i18n.createGame.selectGame}
          // onChange={boardBind.onChange}
          onChange={newValue => boardBind.onChangeVal(newValue)}
          data={config.boards}
          mb="md"
        />

        {/* players */}
        <InputWrapper label={i18n.createGame.players}>
          {players.map((player: PlayerData, i: number) => (
            <Container px={0} key={`player-input-${i}`} mb="sm">
              <TextInput
                placeholder="name"
                onChange={({ target }: { target: HTMLInputElement }) => updatePlayer('name', target.value, i)}
                value={player.name}
                rightSection={i >= 2 && (
                  <CloseButton
                    onClick={() => removePlayer(i)}
                  />
                )}
              />
            </Container>
          ))}
        </InputWrapper>

        <Button
          mb="md"
          disabled={players.length >= config.maxPlayers}
          onClick={() => setPlayers([...players, { name: '' }])}
        >
          {i18n.createGame.addPlayer}
        </Button>

        {/* gametype */}
        <RadioGroup
          mb="md"
          value={gameType}
          label={i18n.createGame.gameType}
          onChange={newValue => gameTypeBind.onChangeVal(newValue)}
        >
          {gameTypeOptions.map(o => (
            <Radio
              label={o.label}
              value={o.value}
              key={o.value}
            />
          ))}
        </RadioGroup>

        {/* local player selection for remote games */}
        {gameType === GameType.remote ? <RadioGroup
          mb="md"
          label={i18n.createGame.playingAs}
          onChange={newValue => localPlayerBind.onChangeVal(newValue)}
        >
          {players.filter(p => !!p.name).map(p => (
            <Radio
              name="localPlayer"
              label={p.name}
              key={p.name}
              value={p.name}
              checked={localPlayer === p.name}
            />
          ))}
        </RadioGroup> : null}

        {/* submit */}
        <Button
          disabled={!isReadyToStart()}
          onClick={validateAndSubmit}
          role="button"
        >
          {i18n.createGame.start}
        </Button>

        <Text mt="md" size="sm">
          <a href="/">{i18n.home.backLink}</a>
        </Text>
      </>
    </CenterLayout>
  );
}