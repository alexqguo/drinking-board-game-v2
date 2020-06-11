import { observable, action } from 'mobx';
import { Player } from 'src/types';

export default class PlayerStore {
  @observable players: Map<string, Player> = new Map();

  @action addPlayer = (player: Player) => {
    this.players.set(player.id, player);
  }
}