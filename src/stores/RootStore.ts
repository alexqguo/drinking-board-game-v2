import {
  get,
  ref,
  child,
  update,
  onValue,
  onChildAdded,
  onChildChanged,
  DataSnapshot,
  DatabaseReference,
  onChildRemoved,
} from 'firebase/database';
import GameStore from 'src/stores/GameStore';
import PlayerStore from 'src/stores/PlayerStore';
import AlertStore from 'src/stores/AlertStore';
import BoardStore from 'src/stores/BoardStore';
import ActionStore from 'src/stores/ActionStore';
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
  GameType,
  AlertAction
} from 'src/types';
import { createId, getAppStage, getCenterPoint } from 'src/utils';
import { db } from 'src/firebase';
import GameEventHandler from 'src/engine/game';
import gen1 from 'src/games/pokemon-gen1';
import gen2 from 'src/games/pokemon-gen2';
import gen3 from 'src/games/pokemon-gen3';

export default class RootStore {
  gameStore: GameStore;
  playerStore: PlayerStore;
  alertStore: AlertStore;
  boardStore: BoardStore;
  actionStore: ActionStore;
  prefix: string = '';
  gameId: string = '';
  extension: GameExtensionInfo | null = null;;
  gameRef: DatabaseReference | null = null;
  playerRef: DatabaseReference | null = null;
  alertRef: DatabaseReference | null = null;
  actionRef: DatabaseReference | null = null;

  constructor() {
    this.gameStore = new GameStore(this);
    this.playerStore = new PlayerStore(this);
    this.alertStore = new AlertStore(this);
    this.actionStore = new ActionStore(this);
    this.boardStore = new BoardStore();
  }

  reset() {
    this.gameStore = new GameStore(this);
    this.playerStore = new PlayerStore(this);
    this.alertStore = new AlertStore(this);
    this.actionStore = new ActionStore(this);
    this.boardStore = new BoardStore();
  }

  async createGame(options: CreateGameOptions): Promise<string> {
    this.reset();
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
      board,
      id: gameId,
      type: gameType,
      state: GameState.NOT_STARTED,
      currentPlayerId: playerData[0].id,
      currentRoll: null,
      turnOrder: TurnOrder.normal
    };

    const initialSessionData: SessionData = {
      actions: [],
      game: gameData,
      players: playerData,
      alert: AlertStore.defaultAlert(),
    };

    this.subscribeToGame();
    await Promise.all([
      this.fetchBoard(board),
      this.fetchImage(board),
      this.getExtension(board),
      update(ref(db, this.prefix), initialSessionData)
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
    this.gameRef = ref(db, `${this.prefix}/game`);
    onValue(this.gameRef, (snap: DataSnapshot) => {
      this.gameStore.setGame(snap.val() as GameData);
    })

    this.playerRef = ref(db, `${this.prefix}/players`);
    const setPlayerCb = (snap: DataSnapshot) => {
      this.playerStore.setPlayer(snap.val() as Player);
    }
    onChildAdded(this.playerRef, setPlayerCb);
    onChildChanged(this.playerRef, setPlayerCb);

    this.alertRef = ref(db, `${this.prefix}/alert`);
    onValue(this.alertRef, (snap: DataSnapshot) => {
      this.alertStore.setAlert(snap.val() as Alert);
    });

    this.actionRef = ref(db, `${this.prefix}/actions`);
    onChildAdded(this.actionRef, (snap: DataSnapshot) => {
      this.actionStore.setActionChildAdded(snap.val() as AlertAction);
    });
    onChildChanged(this.actionRef, (snap: DataSnapshot) => {
      this.actionStore.setActionChildChanged(snap.val() as AlertAction);
    });
    onChildRemoved(this.actionRef, (snap: DataSnapshot) => {
      this.actionStore.removeAction(snap.val() as AlertAction);
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
    const snap: DataSnapshot = await get(child(ref(db), path));

    return snap.val();
  }

  async restoreSession(options: RestoreGameOptions) {
    this.reset();
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
      get(child(this.gameRef!, '/')), // Ensure stores are hydrated before redirecting
      get(child(this.playerRef!, '/')), // Honestly not sure why specifically these two are here
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
      case 'pokemon-gen2': this.extension = gen2(this);
      case 'pokemon-gen3': this.extension = gen3(this);
    }
  }

  static createPrefix(gameId: string) {
    return `v2/sessions/${getAppStage()}/${gameId}`;
  }
}