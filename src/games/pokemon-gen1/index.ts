import { GameState, GameExtensionInfo } from 'src/types';
import RootStore from 'src/stores/RootStore';

export default (rootStore: RootStore): GameExtensionInfo => {
  console.log('gen 1');

  return {
    gameEvents: {
      [GameState.GAME_START]: () => {
        console.log('asdf')
      },
      [GameState.MOVE_END]: () => {

      },
    },
  };
}