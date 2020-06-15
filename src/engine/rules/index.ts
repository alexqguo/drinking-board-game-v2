import rootStore from 'src/stores';
import { RuleSchema, RuleHandler } from 'src/types';
import DisplayRule from 'src/engine/rules/DisplayRule';

/*
Brainstorm how rules will work

Rule

DisplayRule
- set game alert message

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

ExtraTurnRule
- increment player effect for extra turns

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

const ruleMappings: { [key: string]: RuleHandler } = {
  DisplayRule,
};

export default async (ruleIndex: number) => {
  const { alertStore, boardStore } = rootStore;
  const rule: RuleSchema = boardStore.boardSchema.tiles[ruleIndex].rule;

  alertStore.update({
    open: true,
    canClose: false,
    ruleIdx: ruleIndex,
  });

  let handler = ruleMappings[rule.type];
  if (!handler) {
    console.warn(`No handler found for ${rule.type}, falling back to DisplayRule`);
    handler = DisplayRule;
  }
  handler(rule);
};