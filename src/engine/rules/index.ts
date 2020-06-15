import rootStore from 'src/stores';

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
export default (rule: any) => {
  const { gameStore, alertStore } = rootStore;

  
};