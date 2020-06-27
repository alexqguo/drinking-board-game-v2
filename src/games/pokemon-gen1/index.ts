import { GameState, GameExtensionInfo, AlertState } from 'src/types';
import RootStore from 'src/stores/RootStore';
import hello from 'src/games/pokemon-gen1/hello';

export default (rootStore: RootStore): GameExtensionInfo => {
  const { alertStore } = rootStore;

  console.log(hello);
  return {
    gameEvents: {
      [GameState.GAME_START]: () => {
        console.log('asdf')
      },
      [GameState.MOVE_END]: () => {

      },
      pikachuProxyRule: () => {
        console.log('pikachu rule!');
        // TODO - do the thing
        alertStore.update({ state: AlertState.CAN_CLOSE });
      }
    },
    components: {
      asdf: hello,
    }
  };
}