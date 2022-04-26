import rootStore from 'src/stores';
import {
  RuleSchema,
  RuleHandler,
  AlertState,
  Direction,
  PlayerTarget,
  AlertAction,
  ActionType,
  ActionStatus,
} from 'src/types';
import { validateOneOf, validateRequired } from 'src/engine/rules';
import { clamp, createId, sumNumbers } from 'src/utils';
import ActionStore from 'src/stores/ActionStore';


/**
 * In charge of updating the player location in the store and resolving the alert
 */
const movePlayer = async (targetPlayerId: string, targetTileIndex: number) => {
  const { playerStore, alertStore } = rootStore;
  await playerStore.updatePlayer(targetPlayerId, { tileIndex: targetTileIndex });
  alertStore.update({ state: AlertState.CAN_CLOSE });
};

/**
 * Invoked when there are no actions
 */
const calculateNewPositionAndMovePlayer = (targetPlayerId: string, rule: RuleSchema) => {
  const { playerStore, boardStore } = rootStore;
  const { numSpaces, tileIndex } = rule;
  const targetPlayer = playerStore.players.get(targetPlayerId)!;
  const finalBoardIndex = boardStore.schema.tiles.length - 1;

  let destinationIdx = targetPlayer.tileIndex; // Default to where they currently are, just in case
  if (numSpaces) {
    destinationIdx = clamp(targetPlayer.tileIndex + numSpaces, 0, finalBoardIndex);
  } else if (typeof tileIndex === 'number') {
    destinationIdx = clamp(tileIndex, 0, finalBoardIndex);
  }

  movePlayer(targetPlayerId, destinationIdx);
}

const MoveRule: RuleHandler = async (rule: RuleSchema) => {
  const { actionStore, gameStore, alertStore } = rootStore;

  if (!validateRequired(rule.playerTarget)
    || !validateOneOf(rule.numSpaces, rule.direction, rule.diceRolls, rule.tileIndex)) {
    console.error('playerTarget is a required field. ' +
      'One of numSpaces, diceRolls, tileIndex, direction is also required', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  const { playerTarget, diceRolls } = rule;
  const actions: AlertAction[] = [];

  // TODO - support allOthers. Currently no rules utilize it. Should be simple
  // If it's a custom player selection, add that action
  if (playerTarget === PlayerTarget.custom) {
    actions.push({
      id: createId('action'),
      ruleId: rule.id,
      playerId: gameStore.game.currentPlayerId,
      type: ActionType.playerSelection,
      status: ActionStatus.ready,
      value: null,
      candidateIds: gameStore.otherPlayerIds,
    });
  }

  // If dice rolls are required, add those actions
  if (diceRolls) {
    const diceRollActions = ActionStore.createNDiceRollActionObjects({
      n: diceRolls.numRequired,
      ruleId: rule.id,
      status: ActionStatus.dependent,
      playerId: gameStore.game.currentPlayerId,
    });
    actions.push(...diceRollActions);
  }

  // If there are no actions, we should be able to resolve now
  if (!actions.length) {
    calculateNewPositionAndMovePlayer(gameStore.game.currentPlayerId, rule);
  } else {
    await actionStore.createNewActions(actions);
  }
};

MoveRule.postActionHandler = (rule: RuleSchema, actions: AlertAction[]) => {
  const { gameStore, playerStore, boardStore } = rootStore;
  const { direction, diceRolls } = rule;
  const finalBoardIndex = boardStore.schema.tiles.length - 1;

  const isDone = actions.every(a => !!a.value);
  if (isDone && diceRolls) {
    let playerIdToMove = gameStore.game.currentPlayerId;
    const rolls = actions.filter(a => !!a.value && !isNaN(Number(a.value)))
      .map(a => a.value);
    const total = sumNumbers(rolls) * (direction === Direction.back ? -1 : 1);

    if (actions[0].type === ActionType.playerSelection) {
      playerIdToMove = actions[0].value;
    }
    const targetPlayer = playerStore.players.get(playerIdToMove)!;

    movePlayer(playerIdToMove, clamp(targetPlayer.tileIndex + total, 0, finalBoardIndex));
  } else if (isDone) {
    // No dice rolls, it was just a player selection
    const playerSelectionId = actions[0].value;
    calculateNewPositionAndMovePlayer(playerSelectionId, rule);
  }
};

export default MoveRule;