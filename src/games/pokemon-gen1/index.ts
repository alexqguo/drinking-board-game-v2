import { GameState, GameExtensionInfo, AlertState, Player, AlertAction } from 'src/types';
import en from 'src/i18n/en_US.json';
import { formatString } from 'src/providers/TranslationProvider';
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

const trainerBattleRuleId = 'battle_gen1';

export default (rootStore: RootStore): GameExtensionInfo => {
  const { gameStore, playerStore, alertStore, actionStore, boardStore } = rootStore;

  const getBattleResults = (actions: AlertAction[]): { winners: Player[], losers: Player[] } => {
    const losers: Player[] = [];
    const winners: Player[] = [];
    const maxRoll = Math.max(...actions.map(a => Number(a.value)));
    const resultsPerPlayer = actions.reduce((acc: { [key: string]: number[] }, cur: AlertAction) => {
      if (!acc[cur.playerId]) acc[cur.playerId] = [];
      acc[cur.playerId].push(Number(cur.value));
      return acc;
    }, {});

    Object.keys(resultsPerPlayer).forEach((playerId: string) => {
      const playerMax = Math.max(...resultsPerPlayer[playerId]);
      const player = playerStore.players.get(playerId)!;

      if (playerMax === maxRoll) {
        winners.push(player);
      } else {
        losers.push(player);
      }
    });

    return { winners, losers };
  }

  return {
    battleHandler: (actions: AlertAction[]) => {
      const isDone = actions.every(a => !!a.value);

      if (isDone) {
        let message;
        const { winners, losers } = getBattleResults(actions);

        if (winners.length > 1 && losers.length === 0) {
          message = en.battle.tie;
        } else {
          message = formatString(en.battle.result, {
            winners: winners.map(p => p.name).join(', '),
            losers: losers.map(p => p.name).join(', '),
          });
        }

        alertStore.update({
          state: AlertState.CAN_CLOSE,
          messageOverride: message,
        });
      }
    },
    gameEvents: {
      [GameState.MOVE_END]: () => {
        const currentIdx = playerStore.players.get(gameStore.game.currentPlayerId)!.tileIndex;
        const currentTile = boardStore.schema.tiles[currentIdx];
        const playersAtCurrentTile = Array.from(playerStore.players.values())
          .filter(p => p.tileIndex === currentIdx);

        // No battles at gyms
        if (playersAtCurrentTile.length > 1 && !currentTile.mandatory) {
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
            ruleId: trainerBattleRuleId,
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