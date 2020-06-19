import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState } from 'src/types';
import DisplayRule from 'src/engine/rules/DisplayRule';
import ExtraTurnRule from 'src/engine/rules/ExtraTurnRule';
import SkipTurnRule from 'src/engine/rules/SkipTurnRule';
import DrinkDuringLostTurnsRule from 'src/engine/rules/DrinkDuringLostTurnsRule';

/*
MoveRule
- Three variants: numSpaces, dice rolls, tileIndex
  - numSpaces
    - calculate new tile index, adjust player position
  - dice rolls
    - ask for dice rolls, calculate new tile index, adjust player position
  - adjust player position

SkipTurnRule
- increment player skipped turn effect

SpeedModifierRule
(requires player target)
- generate modifier, append to player effects

TeleportRule
- Shouldn't this just consolidate into move rule?

GameOverRule
- todo

DiceRollRule

DrinkDuringLostTurnsRule
ApplyMoveConditionRule
RollUntilRule
ChoiceRule
SkipNextMandatoryRule
ChallengeRule
AddMandatoryRule
ReverseTurnOrderRule
ProxyRule
GroupRollRule
AnchorRule
RollAugmentRule

*/

export const validateRequiredFields = (...args: any[]): boolean => (
  args
    .filter(arg => typeof arg === 'undefined' || arg === null || arg === '')
    .length === 0
);

const ruleMappings: { [key: string]: RuleHandler } = {
  DisplayRule,
  ExtraTurnRule,
  DrinkDuringLostTurnsRule,
  SkipTurnRule,
};

export default async (ruleIndex: number) => {
  const { alertStore, boardStore } = rootStore;
  const rule: RuleSchema = boardStore.boardSchema.tiles[ruleIndex].rule;

  alertStore.update({
    open: true,
    state: AlertState.PENDING,
    ruleIdx: ruleIndex,
  });

  let handler = ruleMappings[rule.type];
  if (!handler) {
    console.warn(`No handler found for ${rule.type}, falling back to DisplayRule`);
    handler = DisplayRule;
  }
  handler(rule);
};