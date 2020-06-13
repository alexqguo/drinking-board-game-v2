import { observable, action, computed } from 'mobx';
import { GameData, GameType, GameState } from 'src/types';

export default class GameStore {
  @observable localPlayerId: string = '';
  @observable game: GameData = {
    id: '',
    type: GameType.local,
    board: '',
    state: GameState.NOT_STARTED,
    currentPlayerId: '',
  };

  @action setGame = (game: GameData) => {
    this.game = game;
  }

  @action setGameState = (state: GameState) => {
    this.game.state = state;
  }

  @computed get isMyTurn() {
    if (this.game.type === GameType.local) return true;
    return this.localPlayerId === this.game.currentPlayerId;
  }

  /**
   * Player to show in the status section
   * Local games: Current player
   * Remote games: Local player
   */
  @computed get playerStatusId() {
    if (this.game.type === GameType.local) return this.game.currentPlayerId;
    return this.localPlayerId;
  }
}