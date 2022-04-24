import { observable } from 'mobx';
import { GameState, GameExtensionInfo, AlertState } from 'src/types';
import RootStore from 'src/stores/RootStore';
import pokemonSelection from 'src/games/pokemon-gen1/pokemonSelection';

export const starters = Object.freeze({
  pikachu: 'Pikachu',
  squirtle: 'Squirtle',
  bulbasaur: 'Bulbasaur',
  charmander: 'Charmander',
})

export default (rootStore: RootStore): GameExtensionInfo => {
  const { alertStore } = rootStore;
  const isPokemonSelectionCompleted = observable.box(false);

  const pokemonSelectionProps = {
    rootStore,
    onComplete: () => isPokemonSelectionCompleted.set(true),
  };

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
    components: {
      pokemonSelection: () => pokemonSelection(pokemonSelectionProps),
    }
  };
}