import * as React from 'react';
import { useContext, useState } from 'react';
import {
  FormField,
  TextInput,
  Heading,
  SelectField,
  Button,
  RadioGroup,
} from 'evergreen-ui';
import useInput from 'src/hooks/useInput';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { GameType, CreateGameOptions, Board } from 'src/types';
import config from 'src/config';

export default () => {
  const i18n = useContext(TranslationContext);
  const [board, boardBind] = useInput(config.boards[0]);
  const [players, setPlayers] = useState<string[]>(['', '']);
  const [gameType, gameTypeBind] = useInput(GameType.local);
  // const [localPlayer, localPlayerBind] = useInput(''); // Not yet
  const gameTypeOptions = [
    { label: i18n.createGame.local, value: GameType.local },
    { label: i18n.createGame.remote, value: GameType.remote },
  ]; // Don't really want to define this every time

  const isValidName = (name: string) => players.indexOf(name) !== -1 && name.length > 0;
  const updatePlayerName = (target: EventTarget, i: number) => {
    players[i] = (target as HTMLInputElement).value;
    setPlayers([...players]);
  };

  const isReadyToStart = () => {
    const hasBoard: boolean = !!board;
    const isValidGameType: boolean = gameType === GameType.local || gameType === GameType.remote;
    const hasEnoughPlayers: boolean = players.length >= 2;
    const hasValidNames: boolean = players.every(isValidName);
    // Local player validation

    return hasBoard && isValidGameType && hasEnoughPlayers && hasValidNames;
  };

  const validateAndSubmit = async (e: Event) => {
    e.preventDefault();
    if (!isReadyToStart()) return;

    const options: CreateGameOptions = {
      playerNames: players,
      gameType,
      board
    };
    console.log(options);
  }

  return (
    <section>
      <Heading size={800} is="h1">{i18n.createGame.title}</Heading>

      <form autoComplete="off">
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
          <TextInput 
            placeholder="name"
            key={`player-input-${i}`}
            onChange={({ target }: { target: EventTarget }) => updatePlayerName(target, i)}
            value={name}
          />
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

        {/* submit */}
        <Button
          disabled={!isReadyToStart()}
          onClick={validateAndSubmit}
          role="button"
        >
          {i18n.createGame.start}
        </Button>

      </form>
    </section>
  );
}