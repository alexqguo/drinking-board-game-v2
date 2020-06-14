import { observable, action, computed } from 'mobx';
import { GameData, GameType, GameState } from 'src/types';
import RootStore from 'src/stores/RootStore';

export default class GameStore {
  rootStore: RootStore;
  @observable localPlayerId: string = '';
  @observable game: GameData = {
    id: '',
    type: GameType.local,
    board: '',
    state: GameState.NOT_STARTED,
    currentPlayerId: '',
    currentRoll: null,
  };

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  @action setGame = (game: GameData) => {
    this.game = game;
  }

  @action setLocalPlayerId = (localPlayerId: string) => {
    this.localPlayerId = localPlayerId;
  }

  setGameState = (state: GameState) => {
    this.rootStore.gameRef?.update({ state });
  }

  setCurrentPlayer = (playerId: string) => {
    this.rootStore.gameRef?.update({ currentPlayerId: playerId });
  }

  update = (game: Partial<GameData>) => {
    this.rootStore.gameRef?.update(game);
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