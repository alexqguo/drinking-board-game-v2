import { GameState, GameExtensionInfo, AlertState, Player, AlertAction } from 'src/types';
import en from 'src/i18n/en_US.json';
import RootStore from 'src/stores/RootStore';
import ActionStore from 'src/stores/ActionStore';

const starters = Object.freeze({
  pikachu: 'Pikachu',
  squirtle: 'Squirtle',
  bulbasaur: 'Bulbasaur',
  charmander: 'Charmander',
});

const starterStrengths = Object.freeze({
  [starters.pikachu]: starters.squirtle,
  [starters.squirtle]: starters.charmander,
  [starters.charmander]: starters.bulbasaur,
  [starters.bulbasaur]: starters.squirtle,
});

export default (rootStore: RootStore): GameExtensionInfo => {
  const { gameStore, playerStore, alertStore, actionStore } = rootStore;

  return {
    battleHandler: (actions: AlertAction[]) => {
      const isDone = actions.every(a => !!a.value);

      if (isDone) {

      }
    },
    gameEvents: {
      [GameState.MOVE_END]: () => {
        const currentIdx = playerStore.players.get(gameStore.game.currentPlayerId)!.tileIndex;
        const playersAtCurrentTile = Array.from(playerStore.players.values())
          .filter(p => p.tileIndex === currentIdx);
        if (playersAtCurrentTile.length > 1) {
          gameStore.setGameState(GameState.BATTLE);
        } else {
          gameStore.setGameState(GameState.RULE_TRIGGER);
        }
      },
      [GameState.BATTLE]: async () => {
        // Arguably you could just open the modal with this info from MOVE_END, but might as well do it here
        const actions: AlertAction[] = [];
        const currentIdx = playerStore.players.get(gameStore.game.currentPlayerId)!.tileIndex;
        const playersAtCurrentTile = Array.from(playerStore.players.values())
          .filter(p => p.tileIndex === currentIdx);
        const pokemonAtCurrentTile = new Set(playersAtCurrentTile.map(p => p.effects.starter));

        playersAtCurrentTile.forEach((p: Player) => {
          const weakPokemon = starterStrengths[p.effects.starter];
          const hasStrength = pokemonAtCurrentTile.has(weakPokemon);
          actions.push(...ActionStore.createNDiceRollActionObjects({
            n: (hasStrength ? 2 : 1),
            playerId: p.id,
          }));
        });

        await actionStore.createNewActions(actions);
        alertStore.update({
          open: true,
          ruleIdx: -1,
          nextGameState: GameState.RULE_TRIGGER,
          state: AlertState.PENDING,
          headingOverride: en.battle.title,
          messageOverride: en.battle.description,
        });
      },
    },
  };
}