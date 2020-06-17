import { observable, computed, action } from 'mobx';
import { Player, PlayerEffects } from 'src/types';
import RootStore from 'src/stores/RootStore';
import { db } from 'src/firebase';

export default class PlayerStore {
  rootStore: RootStore;
  @observable players: Map<string, Player> = new Map();

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  @action setPlayer = (player: Player) => {
    this.players.set(player.id, player);
  }

  @computed get ids(): string[] {
    return Array.from(this.players.keys());
  }

  // TODO - needs to be a way to update just the effects, this will overwrite
  updatePlayer = async (id: string, playerData: Partial<Player>) => {
    const playerSnap = await this.rootStore.playerRef?.orderByChild('id').equalTo(id).once('value');
    const [key, player] = Object.entries(playerSnap!.val())[0];
    db.ref(`${this.rootStore.prefix}/players/${key}`).update(playerData);
  }

  static defaultEffects = (): PlayerEffects => ({
    extraTurns: 0,
  })
}