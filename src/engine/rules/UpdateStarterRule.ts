import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState, PlayerTarget, ActionType, ActionStatus, AlertAction } from 'src/types';
import { validateOneOf } from 'src/engine/rules';
import { createId } from 'src/utils';

const UpdateStarterRule: RuleHandler = async (rule: RuleSchema) => {
  const { playerStore, gameStore, alertStore, actionStore } = rootStore;
  const { starters, playerTarget } = rule;

  if (!validateOneOf(starters, playerTarget)) {
    console.error('starters is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  if (starters) {
    const starterToReplaceWith = starters![0];

    playerStore.updateEffects(gameStore.game.currentPlayerId, {
      starter: starterToReplaceWith,
    });
    alertStore.update({ state: AlertState.CAN_CLOSE });
  } else if (playerTarget === PlayerTarget.custom) {
    actionStore.createNewActions([{
      id: createId('action'),
      ruleId: rule.id,
      playerId: gameStore.game.currentPlayerId,
      type: ActionType.playerSelection,
      status: ActionStatus.ready,
      candidateIds: gameStore.otherPlayerIds,
      value: null,
    }]);
  }
};

UpdateStarterRule.postActionHandler = (rule: RuleSchema, actions: AlertAction[]) => {
  const { alertStore, playerStore, gameStore } = rootStore;
  const isDone = actions.every(a => !!a.value);

  if (isDone) {
     // There should hopefully only be one player select action. If not this will break :)
    const playerAction = actions.find(a => a.type === ActionType.playerSelection);
    const currentPlayer = playerStore.players.get(gameStore.game.currentPlayerId)!;
    const selectedPlayer = playerStore.players.get(playerAction?.value)!;

    playerStore.updateEffects(currentPlayer.id, { starter: selectedPlayer.effects.starter });
    playerStore.updateEffects(selectedPlayer.id, { starter: currentPlayer.effects.starter });
    alertStore.update({ state: AlertState.CAN_CLOSE });
  }
};

export default UpdateStarterRule;