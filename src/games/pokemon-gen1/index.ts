import { autorun, observable } from 'mobx';
import { GameState, GameExtensionInfo, AlertState } from 'src/types';
import RootStore from 'src/stores/RootStore';
import pokemonSelection from 'src/games/pokemon-gen1/pokemonSelection';

export default (rootStore: RootStore): GameExtensionInfo => {
  const { alertStore } = rootStore;
  const isPokemonSelectionCompleted = observable.box(false);

  const pokemonSelectionProps = {
    rootStore,
    onComplete: () => isPokemonSelectionCompleted.set(true),
  };

  return {
    gameEvents: {
      [GameState.GAME_START]: () => {
        alertStore.update({
          open: true,
          nextGameState: GameState.TURN_CHECK,
          customComponent: 'pokemonSelection',
          headingOverride: 'Choose your Pokemon!',
        });

        return new Promise(resolve => {
          autorun(async (reaction) => {
            if (isPokemonSelectionCompleted.get() === true) {
              await alertStore.clear();
              // await alertStore.update({ open: false, });
              // alertStore.clear();
              reaction.dispose();
              resolve();
            }
          });
        });
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
      pokemonSelection: () => pokemonSelection(pokemonSelectionProps),
    }
  };
}