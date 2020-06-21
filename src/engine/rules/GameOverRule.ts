import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState } from 'src/types';

const GameOverRule: RuleHandler = async (rule: RuleSchema) => {
  const { playerStore, alertStore, gameStore } = rootStore;
  await playerStore.updatePlayer(gameStore.game.currentPlayerId, { hasWon: true });
  alertStore.update({ state: AlertState.CAN_CLOSE });
};

export default GameOverRule;