import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState } from 'src/types';

// TODO - this should probably be incorporated into DiceRollRule. It's basically only used for SS Anne
const DrinkDuringLostTurnsRule: RuleHandler = async (rule: RuleSchema) => {
  const { playerStore, gameStore, alertStore } = rootStore;
  const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;

  // await rootStore.playerStore.updatePlayer(currentPlayer.id, {
  //   effects: {
  //     extraTurns: currentPlayer.effects.extraTurns + 1,
  //   }
  // });


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
  alertStore.update({ state: AlertState.CAN_CLOSE });
};

export default DrinkDuringLostTurnsRule;