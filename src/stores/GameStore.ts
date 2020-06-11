import { observable, action } from 'mobx';
import { GameData, GameType } from 'src/types';

export default class GameStore {
  @observable game: GameData = {
    id: '',
    type: GameType.local,
    board: '',
  };

  @action setGame = (game: GameData) => {
    this.game = game;
  }
}