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
} from 'evergreen-ui';
import useInput from 'src/hooks/useInput';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { GameType, CreateGameOptions, Board } from 'src/types';
import config from 'src/config';
import { StoreContext } from 'src/providers/StoreProvider';

export default () => {
  const store = useContext(StoreContext);
  const i18n = useContext(TranslationContext);
  const [board, boardBind] = useInput(config.boards[0]);
  const [createdGameId, setCreatedGameId] = useState('');
  const [players, setPlayers] = useState<string[]>(['', '']);
  const [gameType, gameTypeBind] = useInput(GameType.local);
  const [localPlayer, localPlayerBind] = useInput('');

  if (createdGameId) return <Redirect to={`/game/${createdGameId}`} />;

  const gameTypeOptions = [
    { label: i18n.createGame.local, value: GameType.local },
    { label: i18n.createGame.remote, value: GameType.remote },
  ]; // Don't really want to define this every time

  const isValidName = (name: string) => players.indexOf(name) !== -1 && name.length > 0;
  const removePlayer = (idx: number) => {
    players.splice(idx, 1);
    setPlayers([...players]);
  };
  const updatePlayerName = (target: EventTarget, i: number) => {
    players[i] = (target as HTMLInputElement).value;
    setPlayers([...players]);
  };

  const isReadyToStart = () => {
    const hasBoard: boolean = !!board;
    const isValidGameType: boolean = gameType === GameType.local || gameType === GameType.remote;
    const hasEnoughPlayers: boolean = players.length >= 2;
    const hasValidNames: boolean = players.every(isValidName);
    const hasLocalPlayer: boolean = !!localPlayer && players.indexOf(localPlayer) !== -1;

    return hasBoard && isValidGameType && hasEnoughPlayers && hasValidNames && hasLocalPlayer;
  };

  const validateAndSubmit = async (e: Event) => {
    e.preventDefault();
    if (!isReadyToStart()) return;

    const options: CreateGameOptions = {
      localPlayer,
      playerNames: players,
      gameType,
      board
    };
    const gameId = await store.createGame(options);
    setCreatedGameId(gameId);
  }

  return (
    <section>
      <Heading size={800} is="h1">{i18n.createGame.title}</Heading>

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
      {players.map((name: string, i: number) => (
        <div key={`player-input-${i}`}>
          <TextInput 
            placeholder="name"
            onChange={({ target }: { target: EventTarget }) => updatePlayerName(target, i)}
            value={name}
          />
          {i >= 2 ? <DeleteIcon 
            color="muted"
            size={12}
            style={{ cursor: 'pointer' }}
            marginLeft={4}
            onClick={() => removePlayer(i)}
          /> : null}
        </div>
      ))}
      <Button
        disabled={players.length >= config.maxPlayers}
        onClick={() => setPlayers([...players, ''])}
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
          {players.filter(p => !!p).map(p => (
            <Radio
              name="localPlayer"
              label={p}
              key={p}
              onChange={e => localPlayerBind.onChange(e)}
            />
          ))}
        </Pane>
      </> : null}

      {/* submit */}
      <Button
        disabled={!isReadyToStart()}
        onClick={validateAndSubmit}
        role="button"
      >
        {i18n.createGame.start}
      </Button>
    </section>
  );
}