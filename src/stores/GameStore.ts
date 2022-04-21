import { observable, action, computed, makeObservable } from 'mobx';
import { update } from 'firebase/database';
import { GameData, GameType, GameState, TurnOrder } from 'src/types';
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
    turnOrder: TurnOrder.normal
  };

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeObservable(this);
  }

  @action setGame = (game: GameData) => {
    this.game = game;
  }

  @action setLocalPlayerId = (localPlayerId: string) => {
    this.localPlayerId = localPlayerId;
  }

  setGameState = (state: GameState) => {
    update(this.rootStore.gameRef!, { state });
  }

  setCurrentPlayer = (playerId: string) => {
    update(this.rootStore.gameRef!, { currentPlayerId: playerId });
  }

  update = (game: Partial<GameData>) => {
    update(this.rootStore.gameRef!, game);
  }

  @computed get isMyTurn() {
    if (this.game.type === GameType.local) return true;
    return this.localPlayerId === this.game.currentPlayerId;
  }

  @computed get otherPlayerIds() {
    return this.rootStore.playerStore.ids.filter((id: string) => id !== this.game.currentPlayerId);
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