import { observable, action } from 'mobx';
import { GameData, GameType, GameState } from 'src/types';

export default class GameStore {
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
}