import GameStore from 'src/stores/GameStore';
import PlayerStore from 'src/stores/PlayerStore';
import AlertStore from 'src/stores/AlertStore';
import BoardStore from 'src/stores/BoardStore';
import {
  CreateGameOptions,
  SessionData,
  GameData,
  Player,
  GameState,
  BoardSchema,
  RestoreGameOptions,
  Alert,
  TurnOrder,
  GameExtensionInfo,
  GameType
} from 'src/types';
import { createId, getAppStage, getCenterPoint } from 'src/utils';
import { db } from 'src/firebase';
import GameEventHandler from 'src/engine/game';
import gen1 from 'src/games/pokemon-gen1';

export default class RootStore {
  gameStore: GameStore;
  playerStore: PlayerStore;
  alertStore: AlertStore;
  boardStore: BoardStore;
  prefix: string = '';
  gameId: string = '';
  extension: GameExtensionInfo | null = null;;
  gameRef: firebase.database.Reference | null = null;
  playerRef: firebase.database.Reference | null = null;
  alertRef: firebase.database.Reference | null = null;

  constructor() {
    this.gameStore = new GameStore(this);
    this.playerStore = new PlayerStore(this);
    this.alertStore = new AlertStore(this);
    this.boardStore = new BoardStore();
  }

  async createGame(options: CreateGameOptions): Promise<string> {
    const { playerNames, gameType, board, localPlayer } = options;
    const gameId: string = createId('game');
    this.gameId = gameId;
    this.prefix = RootStore.createPrefix(gameId);

    const playerData: Player[] = playerNames.map((name: string) => {
      const id: string = createId('player');
      let isActive = false;
      if (gameType === GameType.remote && name === localPlayer) {
        this.gameStore.setLocalPlayerId(id);
        isActive = true;
      }

      return {
        id,
        name,
        isActive,
        tileIndex: 0,
        hasWon: false,
        effects: PlayerStore.defaultEffects(),
      };
    });

    const gameData: GameData = {
      id: gameId,
      type: gameType,
      board: board.value,
      state: GameState.NOT_STARTED,
      currentPlayerId: playerData[0].id,
      currentRoll: null,
      turnOrder: TurnOrder.normal
    };

    const initialSessionData: SessionData = {
      game: gameData,
      players: playerData,
      alert: AlertStore.defaultAlert(),
    };

    this.subscribeToGame();
    await Promise.all([
      this.fetchBoard(board.value),
      this.fetchImage(board.value),
      this.getExtension(board.value),
      db.ref(this.prefix).set(initialSessionData),
    ]);
    GameEventHandler();

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

    this.alertRef = db.ref(`${this.prefix}/alert`);
    this.alertRef.on('value', (snap: firebase.database.DataSnapshot) => {
      this.alertStore.setAlert(snap.val() as Alert);
    });

    // Browser warning message before leaving the page
    window.addEventListener('beforeunload', (e: Event) => {
      e.preventDefault();
      e.returnValue = true;
    });

    // Set player to inactive when leaving the page
    window.addEventListener('unload', async () => {
      const { localPlayerId } = this.gameStore;
      if (localPlayerId) {
        await this.playerStore.updatePlayer(localPlayerId, { isActive: false });
      }
    });
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
    this.prefix = RootStore.createPrefix(gameId);
    this.gameStore.setLocalPlayerId(localPlayerId);

    this.subscribeToGame();

    // If localPlayerId exists, it's a remote game. If local, don't do anything here
    if (localPlayerId) {
      this.playerStore.updatePlayer(localPlayerId, { isActive: true });
    }
    
    await Promise.all([
      this.fetchBoard(board),
      this.fetchImage(board),
      this.getExtension(board),
      this.gameRef?.once('value'), // Ensure stores are hydrated before redirecting
      this.playerRef?.once('value'),
    ]);
    GameEventHandler();
  }

  scrollToCurrentPlayer() {
    const { playerStore, gameStore, boardStore } = this;
    const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
    const position = getCenterPoint(boardStore.schema.tiles[currentPlayer.tileIndex].position);
    window.scrollTo({
      top: position.y - (window.outerHeight / 2),
      left: position.x - (window.outerWidth / 2),
      behavior: 'smooth',
    });
  }

  /**
   * Eventually the game extensions will live separately as ES modules imported dynamically
   */
  getExtension(boardName: string) {
    switch (boardName) {
      case 'pokemon-gen1': this.extension = gen1(this);
    }
  }

  static createPrefix(gameId: string) {
    return `v2/sessions/${getAppStage()}/${gameId}`;
  }
}