import GameStore from 'src/stores/GameStore';

export default class RootStore {
  gameStore: GameStore;

  constructor() {
    this.gameStore = new GameStore();  
  }

  async createGame() {
    
  }

  async subscribeToGame() {

  }
}