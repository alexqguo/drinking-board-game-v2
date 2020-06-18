import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState } from 'src/types';

const ExtraTurnRule: RuleHandler = async (rule: RuleSchema) => {
  const { playerStore, gameStore, alertStore } = rootStore;
  const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;

  await rootStore.playerStore.updateEffects(currentPlayer.id, {
    extraTurns: currentPlayer.effects.extraTurns + 1,
  });
  alertStore.update({ state: AlertState.CAN_CLOSE });
};

export default ExtraTurnRule;