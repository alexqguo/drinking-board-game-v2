import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState } from 'src/types';

// Rule implementation imports
import DisplayRule from 'src/engine/rules/DisplayRule';
import ExtraTurnRule from 'src/engine/rules/ExtraTurnRule';
import SkipTurnRule from 'src/engine/rules/SkipTurnRule';
import SpeedModifierRule from 'src/engine/rules/SpeedModifierRule';
import RollUntilRule from 'src/engine/rules/RollUntilRule';
import MoveRule from 'src/engine/rules/MoveRule';
import ChoiceRule from 'src/engine/rules/ChoiceRule';
import DiceRollRule from 'src/engine/rules/DiceRollRule';
import GameOverRule from 'src/engine/rules/GameOverRule';
import AddMandatoryRule from 'src/engine/rules/AddMandatoryRule';
import ChallengeRule from 'src/engine/rules/ChallengeRule';
import SkipNextMandatoryRule from 'src/engine/rules/SkipNextMandatoryRule';
import ReverseTurnOrderRule from 'src/engine/rules/ReverseTurnOrderRule';
import ApplyMoveConditionRule from 'src/engine/rules/ApplyMoveConditionRule';
import DrinkDuringLostTurnsRule from 'src/engine/rules/DrinkDuringLostTurnsRule';

/*

- tricky
a bit of ApplyMoveConditionRule
GroupRollRule
RollAugmentRule

- simple
AnchorRule
ProxyRule

*/

export const validateRequired = (...args: any[]): boolean => (
  args
    .filter(arg => typeof arg === 'undefined' || arg === null || arg === '')
    .length === 0
);

export const validateOneOf = (...args: any[]): boolean => (
  args.reduce((acc: number, cur: any) => (acc + (!!cur || typeof cur === 'number' ? 1 : 0)), 0) > 0
);

const ruleMappings: { [key: string]: RuleHandler } = {
  DisplayRule,
  ExtraTurnRule,
  MoveRule,
  RollUntilRule,
  AddMandatoryRule,
  DiceRollRule,
  GameOverRule,
  DrinkDuringLostTurnsRule,
  ApplyMoveConditionRule,
  ChoiceRule,
  ReverseTurnOrderRule,
  ChallengeRule,
  SkipTurnRule,
  SpeedModifierRule,
  SkipNextMandatoryRule,
};

export const getHandlerForRule = (rule: RuleSchema): RuleHandler => {
  let handler = ruleMappings[rule.type];
  if (!handler) {
    console.error(`No handler found for ${rule.type}, falling back to DisplayRule`);
    handler = DisplayRule;
  }

  return handler;
}

export default async (ruleIndex: number) => {
  const { alertStore, boardStore } = rootStore;
  const rule: RuleSchema = boardStore.schema.tiles[ruleIndex].rule;

  alertStore.update({
    open: true,
    state: AlertState.PENDING,
    ruleIdx: ruleIndex,
  });

  const handler = getHandlerForRule(rule);
  handler(rule);
};