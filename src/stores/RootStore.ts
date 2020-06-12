import GameStore from 'src/stores/GameStore';
import PlayerStore from 'src/stores/PlayerStore';
import { CreateGameOptions, SessionData, GameData, Player, GameState } from 'src/types';
import { createId, getAppStage } from 'src/utils';
import { db } from 'src/firebase';

export default class RootStore {
  gameStore: GameStore;
  playerStore: PlayerStore;
  prefix: string = '';
  gameId: string = '';
  gameRef: firebase.database.Reference | null = null;
  playerRef: firebase.database.Reference | null = null;

  constructor() {
    this.gameStore = new GameStore();
    this.playerStore = new PlayerStore();
  }

  createGame(options: CreateGameOptions): Promise<string> {
    return new Promise((resolve) => {
      const { playerNames, gameType, board } = options;
      const gameId: string = createId('game');
      this.gameId = gameId;
      this.prefix = `v2/sessions/${getAppStage()}/${gameId}`;
  
      const playerData: Player[] = playerNames.map((name: string) => {
        const id: string = createId('player');
  
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
      };
  
      const initialSessionData: SessionData = {
        game: gameData,
        players: playerData,
      };
  
      this.subscribeToGame();
      Promise.all([
        this.fetchBoard(board.value),
        this.fetchImage(board.value),
        db.ref(this.prefix).set(initialSessionData),
      ]).then((values) => {
        const board = values[0];
        console.log('board json', board);
        resolve(gameId);
      });
    });
  }

  fetchBoard = (path: string): Promise<any> => {
    return new Promise(resolve => {
      fetch(`games/${path}/index.json`)
        .then(resp => resp.json())
        .then(data => resolve(data));
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
      this.playerStore.addPlayer(snap.val() as Player);
    });
    this.playerRef.on('child_changed', () => {
      console.log('Time to fix this!');
    })

    // Pull JSON for the game and stores it locally
  }
}