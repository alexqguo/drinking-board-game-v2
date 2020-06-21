import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState } from 'src/types';

// Rule implementation imports
import DisplayRule from 'src/engine/rules/DisplayRule';
import ExtraTurnRule from 'src/engine/rules/ExtraTurnRule';
import SkipTurnRule from 'src/engine/rules/SkipTurnRule';
import SpeedModifierRule from 'src/engine/rules/SpeedModifierRule';
import RollUntilRule from 'src/engine/rules/RollUntilRule';
import MoveRule from 'src/engine/rules/MoveRule';
import GameOverRule from 'src/engine/rules/GameOverRule';
import AddMandatoryRule from 'src/engine/rules/AddMandatoryRule';
import SkipNextMandatoryRule from 'src/engine/rules/SkipNextMandatoryRule';
import DrinkDuringLostTurnsRule from 'src/engine/rules/DrinkDuringLostTurnsRule';

/*

- tricky
DiceRollRule
ApplyMoveConditionRule
ChoiceRule
ChallengeRule
GroupRollRule
RollAugmentRule

- simple

ReverseTurnOrderRule
AnchorRule
ProxyRule

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
  AddMandatoryRule,
  GameOverRule,
  DrinkDuringLostTurnsRule,
  SkipTurnRule,
  SpeedModifierRule,
  SkipNextMandatoryRule,
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