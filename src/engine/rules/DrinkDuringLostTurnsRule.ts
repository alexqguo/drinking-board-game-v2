import rootStore from 'src/stores';
import { AlertAction, RuleSchema, RuleHandler, AlertState, AlertDiceRollInfo, ActionType, ActionStatus } from 'src/types';
import { requireDiceRolls } from 'src/engine/alert';
import { validateRequired } from 'src/engine/rules';
import { formatString } from 'src/providers/TranslationProvider';
import { createId } from 'src/utils';
import en from 'src/i18n/en_US.json'; // TODO - make locale a store value so the engine can use them

// TODO - this should probably be incorporated into DiceRollRule. It's basically only used for SS Anne
const DrinkDuringLostTurnsRule: RuleHandler = async (rule: RuleSchema) => {
  const { gameStore, alertStore, actionStore } = rootStore;

  if (!validateRequired(rule.diceRolls) || !rule.diceRolls?.numRequired) {
    console.error('diceRolls with numRequired is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  const { numRequired } = rule.diceRolls; // Really this should just be hardcoded to 2
  const actions: AlertAction[] = [];
  for(let i = 0; i < numRequired; i++) {
    actions.push({
      id: createId('alert'),
      playerId: gameStore.game.currentPlayerId,
      status: ActionStatus.dependent,
      type: ActionType.roll,
      value: null,
    });
  }
  await actionStore.createNewActions(actions);
};

DrinkDuringLostTurnsRule.postActionHandler = (rule: RuleSchema, actions: AlertAction[]) => {
  const { playerStore, gameStore, alertStore } = rootStore;
  const isDone = actions.filter(a => !!a.value).length === rule.diceRolls?.numRequired;

  if (isDone) {
    const rolls = actions.map(a => a.value);

    playerStore.updateEffects(gameStore.game.currentPlayerId, {
      skippedTurns: {
        numTurns: Number(rolls[0]),
        message: formatString(en.lostTurn.drink, { numTurns: rolls[1] }),
      }
    });

    alertStore.update({ state: AlertState.CAN_CLOSE });
  }
};

export default DrinkDuringLostTurnsRule;