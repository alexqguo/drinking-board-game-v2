import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import {
  FormField,
  TextInput,
  Heading,
  SelectField,
  Radio,
  Button,
  RadioGroup,
  DeleteIcon,
  Pane,
  Text,
  Paragraph,
} from 'evergreen-ui';
import useInput from 'src/hooks/useInput';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { GameType, CreateGameOptions, Board } from 'src/types';
import config from 'src/config';
import { StoreContext } from 'src/providers/StoreProvider';
import CenterLayout from 'src/components/CenterLayout';

interface PlayerData {
  name: string,
}

export default () => {
  const store = useContext(StoreContext);
  const i18n = useContext(TranslationContext);
  const [board, boardBind] = useInput('pokemon-gen1');
  const [createdGameId, setCreatedGameId] = useState('');
  const [players, setPlayers] = useState<PlayerData[]>([{ name: '' }, { name: '' }]);
  const [gameType, gameTypeBind] = useInput(GameType.local);
  const [localPlayer, localPlayerBind] = useInput('');

  if (createdGameId) return <Redirect to={`/game/${createdGameId}`} />;

  const gameTypeOptions = [
    { label: i18n.createGame.local, value: GameType.local },
    { label: i18n.createGame.remote, value: GameType.remote },
  ]; // Don't really want to define this every time

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

  const validateAndSubmit = async (e: Event) => {
    e.preventDefault();
    if (!isReadyToStart()) return;

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

  return (
    <CenterLayout>
      <>
        <Heading size={800} is="h1" marginBottom={16}>{i18n.createGame.title}</Heading>

        <Paragraph marginBottom={16}>
          {i18n.createGame.explanation}
        </Paragraph>

        {/* game */}
        <SelectField
          value={board}
          label={i18n.createGame.selectGame}
          onChange={boardBind.onChange}
        >
          {config.boards.map((board: Board) => (
            <option value={board.value} key={board.value}>{board.name}</option>
          ))}
        </SelectField>

        {/* players */}
        <FormField label={i18n.createGame.players} />
        {players.map((player: PlayerData, i: number) => (
          <Pane key={`player-input-${i}`} marginBottom={8}>
            <TextInput
              placeholder="name"
              onChange={({ target }: { target: HTMLInputElement }) => updatePlayer('name', target.value, i)}
              value={player.name}
            />

            {i >= 2 ? <DeleteIcon
              color="muted"
              size={12}
              style={{ cursor: 'pointer' }}
              marginLeft={4}
              onClick={() => removePlayer(i)}
            /> : null}
          </Pane>
        ))}
        <Button
          marginBottom={16}
          disabled={players.length >= config.maxPlayers}
          onClick={() => setPlayers([...players, { name: '' }])}
        >
          {i18n.createGame.addPlayer}
        </Button>

        {/* gametype */}
        <RadioGroup
          label={i18n.createGame.gameType}
          value={gameType}
          options={gameTypeOptions}
          onChange={value => gameTypeBind.onChangeVal(value)}
        />

        {/* local player selection for remote games */}
        {gameType === GameType.remote ? <>
          <Pane role="group">
            <FormField label={i18n.createGame.playingAs} />
            {players.filter(p => !!p.name).map(p => (
              <Radio
                name="localPlayer"
                label={p.name}
                key={p.name}
                checked={localPlayer === p.name}
                onChange={() => localPlayerBind.onChangeVal(p.name)}
              />
            ))}
          </Pane>
        </> : null}

        {/* submit */}
        <Button
          disabled={!isReadyToStart()}
          onClick={validateAndSubmit}
          role="button"
          appearance="primary"
        >
          {i18n.createGame.start}
        </Button>

        <Pane marginTop={16}>
          <Text size={300}>
            <a href="/">{i18n.home.backLink}</a>
          </Text>
        </Pane>
      </>
    </CenterLayout>
  );
}