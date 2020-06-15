import rootStore from 'src/stores';
import { RuleSchema, RuleHandler } from 'src/types';

const ExtraTurnRule: RuleHandler = async (rule: RuleSchema) => {
  const { playerStore, gameStore, alertStore } = rootStore;
  const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;

  await rootStore.playerStore.updatePlayer(currentPlayer.id, {
    effects: {
      extraTurns: currentPlayer.effects.extraTurns + 1,
    }
  });
  alertStore.update({ canClose: true });
};

export default ExtraTurnRule;