import { observable, computed, action, makeObservable } from 'mobx';
import {
  get,
  ref,
  query,
  update,
  equalTo,
  orderByChild,
  DataSnapshot,
} from 'firebase/database';
import { Player, PlayerEffects, ModifierOperation } from 'src/types';
import RootStore from 'src/stores/RootStore';
import { db } from 'src/firebase';

export default class PlayerStore {
  rootStore: RootStore;
  @observable players: Map<string, Player> = new Map();

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeObservable(this);
  }

  @action setPlayer = (player: Player) => {
    this.players.set(player.id, player);
  }

  @computed get ids(): string[] {
    return Array.from(this.players.keys());
  }

  updatePlayer = async (id: string, playerData: Partial<Player>) => {
    const playerSnap: DataSnapshot = await get(query(this.rootStore.playerRef!, orderByChild('id'), equalTo(id)));
    const [key] = Object.entries(playerSnap!.val())[0];
    update(ref(db, `${this.rootStore.prefix}/players/${key}`), playerData);
  }

  updateEffects = async (id: string, newEffects: Partial<PlayerEffects>) => {
    const playerSnap: DataSnapshot = await get(query(this.rootStore.playerRef!, orderByChild('id'), equalTo(id)));
    const [key] = Object.entries(playerSnap!.val())[0];
    update(ref(db, `${this.rootStore.prefix}/players/${key}/effects`), newEffects);
  };

  static defaultEffects = (): PlayerEffects => ({
    starter: '',
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
    rollAugmentation: {
      numTurns: 0,
      operation: ModifierOperation.equal,
      modifier: -1
    },
    moveCondition: {
      ruleId: '',
      numCurrentSuccesses: 0
    },
    anchors: 0,
    items: {},
  })
}