import GameStore from 'src/stores/GameStore';
import PlayerStore from 'src/stores/PlayerStore';
import { CreateGameOptions, SessionData, GameData, Player } from 'src/types';
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

  async createGame(options: CreateGameOptions) {
    const { playerNames, gameType, board } = options;
    const gameId: string = createId('game');
    this.gameId = gameId;
    this.prefix = `v2/sessions/${getAppStage()}/${gameId}`;

    const gameData: GameData = {
      id: gameId,
      type: gameType,
      board: board.value,
    };

    const playerData: Player[] = playerNames.map((name: string) => {
      const id: string = createId('player');

      return {
        id,
        name,
        color: 'blue',
      };
    });

    const initialSessionData: SessionData = {
      game: gameData,
      players: playerData,
    };

    await this.subscribeToGame();
    await db.ref(this.prefix).set(initialSessionData);
    return gameId;
  }

  async subscribeToGame() {
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