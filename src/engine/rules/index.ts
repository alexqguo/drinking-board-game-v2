import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState } from 'src/types';

// Rule implementation imports
import DisplayRule from 'src/engine/rules/DisplayRule';
import ExtraTurnRule from 'src/engine/rules/ExtraTurnRule';
import SkipTurnRule from 'src/engine/rules/SkipTurnRule';
import SpeedModifierRule from 'src/engine/rules/SpeedModifierRule';
import RollUntilRule from 'src/engine/rules/RollUntilRule';
import MoveRule from 'src/engine/rules/MoveRule';
import DrinkDuringLostTurnsRule from 'src/engine/rules/DrinkDuringLostTurnsRule';

/*
MoveRule
- Three variants: numSpaces, dice rolls, tileIndex
  - numSpaces
    - calculate new tile index, adjust player position
  - dice rolls
    - ask for dice rolls, calculate new tile index, adjust player position
  - adjust player position

GameOverRule
- todo

DiceRollRule

ApplyMoveConditionRule
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

export const validateRequired = (...args: any[]): boolean => (
  args
    .filter(arg => typeof arg === 'undefined' || arg === null || arg === '')
    .length === 0
);

export const validateOneOf = (...args: any[]): boolean => (
  args.reduce((acc: number, cur: any) => (acc + (!!cur ? 1 : 0)), 0) > 0
);

const ruleMappings: { [key: string]: RuleHandler } = {
  DisplayRule,
  ExtraTurnRule,
  MoveRule,
  RollUntilRule,
  DrinkDuringLostTurnsRule,
  SkipTurnRule,
  SpeedModifierRule,
};

export default async (ruleIndex: number) => {
  const { alertStore, boardStore } = rootStore;
  const rule: RuleSchema = boardStore.schema.tiles[ruleIndex].rule;

  alertStore.update({
    open: true,
    state: AlertState.PENDING,
    ruleIdx: ruleIndex,
  });

  let handler = ruleMappings[rule.type];
  if (!handler) {
    console.error(`No handler found for ${rule.type}, falling back to DisplayRule`);
    handler = DisplayRule;
  }
  handler(rule);
};