import { autorun } from 'mobx';
import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState, AlertDiceRollInfo, AlertDiceRoll } from 'src/types';
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

  // Construct the initial data for firebase
  const alertDiceRolls: AlertDiceRollInfo = {};
  for (let i = 0; i < numRequired; i++) {
    alertDiceRolls[`roll${i}`] = {
      numRolls: 1,
      result: '',
    };
  }

  alertStore.update({ diceRolls: alertDiceRolls });

  // If the current player closes their screen in the middle of this, when they join back the autorun 
  // won't be set up since the rule already executed, leaving the rule unfinishable. Edge case, but should fix
  autorun(reaction => {
    const keys = Object.keys(alertStore.alert.diceRolls);
    const { diceRolls } = alertStore.alert;
    const hasFullResults = keys.every((key: string) => !!diceRolls[key].result);
    console.log('has full results', hasFullResults);

    if (hasFullResults) {
      reaction.dispose();
      playerStore.updateEffects(currentPlayer.id, {
        skippedTurns: {
          numTurns: Number(diceRolls[keys[0]].result),
          message: formatString(en.lostTurn, { numTurns: diceRolls[keys[1]].result }),
        }
      })
      
      alertStore.update({
        state: AlertState.CAN_CLOSE,
        diceRolls: {},
      });
    }
  });

  /*
  Old code:
  Game.modal.requireDiceRolls(this.diceRolls.numRequired, (rolls: number[]) => {
    times(rolls[0], () => {
      Game.currentPlayer.effects.skippedTurns.push(
        Player.generateSkippedTurnText(`Drink ${rolls[1]}`)
      );
    });
    Game.modal.enableClose();
  });
  */
};

export default DrinkDuringLostTurnsRule;