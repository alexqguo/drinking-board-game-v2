import { observable } from 'mobx';
import { GameState, GameExtensionInfo, AlertState } from 'src/types';
import RootStore from 'src/stores/RootStore';

export const starters = Object.freeze({
  pikachu: 'Pikachu',
  squirtle: 'Squirtle',
  bulbasaur: 'Bulbasaur',
  charmander: 'Charmander',
})

export default (rootStore: RootStore): GameExtensionInfo => {
  const { alertStore } = rootStore;

  return {
    gameEvents: {
      [GameState.MOVE_END]: () => {
        console.log('move ending?');
      },
      pikachuProxyRule: () => {
        console.log('pikachu rule!');
        // TODO - do the thing
        alertStore.update({ state: AlertState.CAN_CLOSE });
      }
    },
  };
}