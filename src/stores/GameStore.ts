import { observable, action } from 'mobx';

export default class GameStore {
  @observable gameId: string = '';

  @action setGameId = (id: string) => {
    this.gameId = id;
  }
}