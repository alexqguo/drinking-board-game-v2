import { GameState, GameExtensionInfo, AlertState } from 'src/types';
import RootStore from 'src/stores/RootStore';

export default (rootStore: RootStore): GameExtensionInfo => {
  const { alertStore } = rootStore;

  return {
    gameEvents: {
      [GameState.GAME_START]: () => {
        console.log('asdf')
      },
      [GameState.MOVE_END]: () => {

      },
      pikachuProxyRule: () => {
        console.log('pikachu rule!');
        alertStore.update({ state: AlertState.CAN_CLOSE });
      }
    },
  };
}