import { observable, computed, action } from 'mobx';
import { Player, PlayerEffects, ModifierOperation } from 'src/types';
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

  updatePlayer = async (id: string, playerData: Partial<Player>) => {
    const playerSnap = await this.rootStore.playerRef?.orderByChild('id').equalTo(id).once('value');
    const [key] = Object.entries(playerSnap!.val())[0];
    db.ref(`${this.rootStore.prefix}/players/${key}`).update(playerData);
  }

  updateEffects = async (id: string, newEffects: Partial<PlayerEffects>) => {
    const playerSnap = await this.rootStore.playerRef?.orderByChild('id').equalTo(id).once('value');
    const [key] = Object.entries(playerSnap!.val())[0];
    db.ref(`${this.rootStore.prefix}/players/${key}/effects`).update(newEffects);
  };

  static defaultEffects = (): PlayerEffects => ({
    extraTurns: 0,
    mandatorySkips: 0,
    customMandatoryTileIndex: -1,
    skippedTurns: {
      numTurns: 0,
      message: '',
    },
    speedModifier: {
      numTurns: 0,
      operation: ModifierOperation.equal,
      modifier: -1
    },
  })
}