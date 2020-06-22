import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, PlayerTarget, AlertState } from 'src/types';
import { requirePlayerSelection } from 'src/engine/alert';
import en from 'src/i18n/en_US.json';

// Alas, the quick shitty hack from v1 remains. Should be a part of ChoiceRule in the future
const ChallengeRule: RuleHandler = async (rule: RuleSchema) => {
  const { alertStore, gameStore, playerStore } = rootStore;
  const challengedPlayerId = (await requirePlayerSelection(PlayerTarget.custom))[0];

  await alertStore.update({ messageOverride: en.challenge.whoWon });

  const playerIds = [gameStore.game.currentPlayerId, challengedPlayerId];
  const winningPlayerId = (await requirePlayerSelection(PlayerTarget.custom, playerIds))[0];
  const winningPlayer = playerStore.players.get(winningPlayerId);
  const losingPlayerId = playerIds.find((id: string) => id !== winningPlayerId)!;
  const losingPlayer = playerStore.players.get(losingPlayerId);

  if (winningPlayer) {
    playerStore.updateEffects(winningPlayerId, {
      extraTurns: winningPlayer.effects.extraTurns + 1,
    });
  }

  if (losingPlayer) {
    playerStore.updateEffects(losingPlayerId, {
      skippedTurns: {
        numTurns: losingPlayer.effects.skippedTurns.numTurns + 1,
        message: en.lostTurn.general,
      }
    });
  }

  if (!winningPlayer || !losingPlayer) { // Should never happen
    console.error(`Both winning/losing players were not detected`, rule);
  }

  alertStore.update({ state: AlertState.CAN_CLOSE });
};

export default ChallengeRule;