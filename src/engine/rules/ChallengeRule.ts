import rootStore from 'src/stores';
import {
  RuleSchema,
  RuleHandler,
  AlertState,
  ActionType,
  AlertAction,
  ActionStatus,
} from 'src/types';
import en from 'src/i18n/en_US.json';
import { createId } from 'src/utils';

// Alas, the quick shitty hack from v1 remains. Should be a part of ChoiceRule in the future
const ChallengeRule: RuleHandler = async (rule: RuleSchema) => {
  const { actionStore, gameStore } = rootStore;
  const action: AlertAction = {
    id: createId('action'),
    playerId: gameStore.game.currentPlayerId,
    type: ActionType.playerSelection,
    status: ActionStatus.ready,
    value: null,
    candidateIds: gameStore.otherPlayerIds,
  };
  await actionStore.createNewActions([action]);
};

ChallengeRule.postActionHandler = (rule: RuleSchema, actions: AlertAction[]) => {
  const { gameStore, alertStore, actionStore, playerStore } = rootStore;
  const actionsDone = actions.every(a => !!a.value);
  const candidatePlayerIds = [gameStore.game.currentPlayerId, actions[0].value];

  if (actionsDone && actions.length === 1) {
    // Add a who won action
    alertStore.update({ messageOverride: en.challenge.whoWon });
    actionStore.createNewActions([{
      id: createId('action'),
      playerId: gameStore.game.currentPlayerId,
      type: ActionType.playerSelection,
      status: ActionStatus.ready,
      value: null,
      candidateIds: candidatePlayerIds,
    }]);
  } else if (actionsDone) {
    const winningPlayerId = actions[1].value;
    const losingPlayerId = candidatePlayerIds.find((id: string) => id !== winningPlayerId)!;
    const winner = playerStore.players.get(winningPlayerId);
    const loser = playerStore.players.get(losingPlayerId);

    if (winner) {
      playerStore.updateEffects(winningPlayerId, {
        extraTurns: winner.effects.extraTurns + 1,
      });
    }

    if (loser) {
      playerStore.updateEffects(losingPlayerId, {
        skippedTurns: {
          numTurns: loser.effects.skippedTurns.numTurns + 1,
          message: en.lostTurn.general,
        }
      });
    }

    if (!winner || !loser) { // Should never happen
      console.error(`Both winning/losing players were not detected`, rule);
    }

    alertStore.update({ state: AlertState.CAN_CLOSE });
  }
};

export default ChallengeRule;