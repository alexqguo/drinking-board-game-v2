import GameStore from 'src/stores/GameStore';
import PlayerStore from 'src/stores/PlayerStore';
import BoardStore from 'src/stores/BoardStore';
import { CreateGameOptions, SessionData, GameData, Player, GameState, BoardSchema, RestoreGameOptions } from 'src/types';
import { createId, getAppStage, getCenterPoint } from 'src/utils';
import { db } from 'src/firebase';
import GameEventHandler from 'src/engine/game';

export default class RootStore {
  gameStore: GameStore;
  playerStore: PlayerStore;
  boardStore: BoardStore;
  prefix: string = '';
  gameId: string = '';
  gameRef: firebase.database.Reference | null = null;
  playerRef: firebase.database.Reference | null = null;

  constructor() {
    this.gameStore = new GameStore(this);
    this.playerStore = new PlayerStore(this);
    this.boardStore = new BoardStore();
  }

  async createGame(options: CreateGameOptions): Promise<string> {
    const { playerNames, gameType, board } = options;
    const gameId: string = createId('game');
    this.gameId = gameId;
    this.prefix = `v2/sessions/${getAppStage()}/${gameId}`;

    const playerData: Player[] = playerNames.map((name: string) => {
      const id: string = createId('player');
      // set localPlayerId if remote game and name === local player name

      return {
        id,
        name,
        tileIndex: 0,
        color: 'blue',
      };
    });

    const gameData: GameData = {
      id: gameId,
      type: gameType,
      board: board.value,
      state: GameState.GAME_START,
      currentPlayerId: playerData[0].id,
      currentRoll: null,
    };

    const initialSessionData: SessionData = {
      game: gameData,
      players: playerData,
    };

    this.subscribeToGame();
    GameEventHandler();
    await Promise.all([
      this.fetchBoard(board.value),
      this.fetchImage(board.value),
      db.ref(this.prefix).set(initialSessionData),
    ]);

    return gameId;
  }

  fetchBoard = (path: string): Promise<BoardSchema> => {
    return new Promise(resolve => {
      fetch(`games/${path}/index.json`)
        .then(resp => resp.json())
        .then(data => {
          this.boardStore.setBoardSchema(data);
          resolve(data);
        });
    });
  };

  fetchImage = (path: string): Promise<void> => {
    return new Promise(resolve => {
      const img = new Image();
      img.src = `games/${path}/index.png`;
      img.addEventListener('load', () => resolve());
    });
  }

  subscribeToGame() {
    this.gameRef = db.ref(`${this.prefix}/game`);
    this.gameRef.on('value', (snap: firebase.database.DataSnapshot) => {
      this.gameStore.setGame(snap.val() as GameData);
    });

    this.playerRef = db.ref(`${this.prefix}/players`);
    this.playerRef.on('child_added', (snap: firebase.database.DataSnapshot) => {
      this.playerStore.setPlayer(snap.val() as Player);
    });
    this.playerRef.on('child_changed', (snap: firebase.database.DataSnapshot) => {
      this.playerStore.setPlayer(snap.val() as Player);
    })
  }

  async findSession(gameId: string): Promise<SessionData> {
    // Means you can't look up prod games in dev mode. Which is fine, for now
    const path = `v2/sessions/${getAppStage()}/${gameId}`;
    const snap: firebase.database.DataSnapshot = await db.ref(path).once('value');
    return snap.val();
  }

  async restoreSession(options: RestoreGameOptions) {
    const { gameId, localPlayerId, board } = options;
    this.gameId = gameId;
    this.prefix = `v2/sessions/${getAppStage()}/${gameId}`;
    this.gameStore.setLocalPlayerId(localPlayerId);

    GameEventHandler();
    this.subscribeToGame();
    await this.gameRef?.once('value'); // To ensure GameStore is hydrated before the
    await Promise.all([
      this.fetchBoard(board),
      this.fetchImage(board),
    ]);
  }

  scrollToCurrentPlayer() {
    const { playerStore, gameStore, boardStore } = this;
    const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
    const position = getCenterPoint(boardStore.boardSchema.tiles[currentPlayer.tileIndex].position);
    window.scrollTo({
      top: position.y - (window.outerHeight / 2),
      left: position.x - (window.outerWidth / 2),
      behavior: 'smooth',
    });
  }
}