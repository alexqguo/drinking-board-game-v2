import { autorun } from 'mobx';
import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState, AlertDiceRollInfo } from 'src/types';
import { requireDiceRolls } from 'src/engine/alert';
import { formatString } from 'src/providers/TranslationProvider';
import en from 'src/i18n/en_US.json'; // TODO - make locale a store value so the engine can use them

// TODO - this should probably be incorporated into DiceRollRule. It's basically only used for SS Anne
const DrinkDuringLostTurnsRule: RuleHandler = async (rule: RuleSchema) => {
  // validate required - diceRolls
  const { playerStore, gameStore, alertStore } = rootStore;
  const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
  const { numRequired } = rule.diceRolls;

  // Should never happen
  if (!numRequired) {
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  const diceRollInfo: AlertDiceRollInfo = await requireDiceRolls(numRequired);
  const keys = Object.keys(diceRollInfo);

  playerStore.updateEffects(currentPlayer.id, {
    skippedTurns: {
      numTurns: Number(diceRollInfo[keys[0]].result),
      message: formatString(en.lostTurn, { numTurns: diceRollInfo[keys[1]].result }),
    }
  });
  
  alertStore.update({ state: AlertState.CAN_CLOSE });
};

export default DrinkDuringLostTurnsRule;