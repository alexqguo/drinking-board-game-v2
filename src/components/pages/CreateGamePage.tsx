import React, { useContext, useEffect, useState } from 'react';
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
  SegmentedControl,
} from 'evergreen-ui';
import useInput from 'src/hooks/useInput';
import { TranslationContext } from 'src/providers/TranslationProvider';
import { GameType, CreateGameOptions, Board, BoardParams, BoardParamOption } from 'src/types';
import config from 'src/config';
import { StoreContext } from 'src/providers/StoreProvider';

interface PlayerData {
  name: string,
  boardParam?: string, // Generic starting params for any game schemaa
}

const memoizedFetch = (function() {
  const cache: Map<String, Object> = new Map();

  return async (board: string) => {
    const existingBoard = cache.get(board);
    if (existingBoard) return existingBoard;

    const boardParamsResp = await fetch(`games/${board}/params.json`);
    const boardParams = await boardParamsResp.json();
    cache.set(board, boardParams);
  
    return boardParams;
  };
})();

export default () => {
  const store = useContext(StoreContext);
  const i18n = useContext(TranslationContext);
  const [board, boardBind] = useInput('');
  const [boardParams, setBoardParams] = useState<BoardParamOption[] | null>(null);
  const [createdGameId, setCreatedGameId] = useState('');
  const [players, setPlayers] = useState<PlayerData[]>([{ name: '' }, { name: '' }]);
  const [gameType, gameTypeBind] = useInput(GameType.local);
  const [localPlayer, localPlayerBind] = useInput('');

  if (createdGameId) return <Redirect to={`/game/${createdGameId}`} />;

  useEffect(() => {
    const fetchBoardParams = async () => {
      const boardParams = (await memoizedFetch(board) as BoardParams);
      setBoardParams(boardParams.options);
    };

    if (board) fetchBoardParams();
  }, [board]);

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
      || (!!localPlayer && players.indexOf(localPlayer) !== -1);

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

  console.log(players);

  return (
    <section>
      <Pane padding={16}>
        <Heading size={800} is="h1">{i18n.createGame.title}</Heading>

        {/* game */}
        <SelectField
          width={280}
          value={board}
          label={i18n.createGame.selectGame} 
          onChange={boardBind.onChange}
        >
          <option disabled selected value=""></option>
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

            {boardParams ? <SegmentedControl
              marginTop={2}
              height={24}
              width={280}
              options={boardParams.map(bp => ({ label: bp.displayName, value: bp.id }))}
              onChange={(val) => updatePlayer('boardParam', val as string, i)}
              value={player.boardParam || ''}
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
            {players.filter(p => !!p).map(p => (
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
        >
          {i18n.createGame.start}
        </Button>
      </Pane>
    </section>
  );
}