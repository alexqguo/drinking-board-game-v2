import { observable, computed, action } from 'mobx';
import { Player } from 'src/types';
import RootStore from 'src/stores/RootStore';

export default class PlayerStore {
  rootStore: RootStore;
  @observable players: Map<string, Player> = new Map();

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  @action addPlayer = (player: Player) => {
    this.players.set(player.id, player);
  }

  @computed get ids(): string[] {
    return Array.from(this.players.keys());
  }
}