import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState, Player, AlertDiceRollInfo, Direction } from 'src/types';
import { validateOneOf, validateRequired } from 'src/engine/rules';
import { requirePlayerSelection, requireDiceRolls } from 'src/engine/alert';
import { clamp } from 'src/utils';

const MoveRule: RuleHandler = async (rule: RuleSchema) => {
  const { alertStore, playerStore, boardStore } = rootStore;

  if (!validateRequired(rule.playerTarget, rule.direction)
    || !validateOneOf(rule.numSpaces, rule.diceRolls, rule.tileIndex)) {
    console.error('playerTarget, direction are required fields. ' + 
      'One of numSpaces, diceRolls, tileIndex is also required', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  const movePlayer = async (targetPlayer: Player, targetTileIndex: number) => {
    await playerStore.updatePlayer(targetPlayer.id, { tileIndex: targetTileIndex });
    alertStore.update({ state: AlertState.CAN_CLOSE });
  };

  const { playerTarget, direction, numSpaces, diceRolls, tileIndex } = rule;
  const playerIds: string[] = await requirePlayerSelection(playerTarget!);
  const targetPlayerId = playerIds[0]; // MoveRule is currently only used with a single player target type
  const targetPlayer: Player = playerStore.players.get(targetPlayerId)!;
  const finalBoardIndex = boardStore.schema.tiles.length - 1;

  if (numSpaces) {
    // TODO - consider using direction here?
    movePlayer(targetPlayer, clamp(targetPlayer.tileIndex + numSpaces, 0, finalBoardIndex));
  } else if (diceRolls) {
    const rolls = await requireDiceRolls(diceRolls.numRequired);
    let total = 0;
    // Could do this more nicely with a reduce
    Object.keys(rolls).forEach((key: string) => {
      const roll = rolls[key];
      // Each roll (or "click") could have been one click for multiple rolls
      const rollTotal = roll.result.split('|').reduce((acc: number, cur: string) => acc + Number(cur), 0);
      total += rollTotal;
    });
    if (direction === Direction.backwards) total *= -1;
    
    movePlayer(targetPlayer, clamp(targetPlayer.tileIndex + total, 0, finalBoardIndex));
  } else if (typeof tileIndex === 'number') {
    movePlayer(targetPlayer, clamp(tileIndex, 0, finalBoardIndex));
  } else {
    console.warn('MoveRule did not result in any updates', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
  }
};

export default MoveRule;