# Drinking board game v2

## TODOs

Boards:
* Add Zelda board
  * mandatory spaces are skipped the second time
  * gohma- combination
  * saria's song space, choice rule
  * boomerang space
  * pull back players
  * poe space may require a few tweaks
  * volvagia
  * water temple swap places rule
  * six barriers, refight previous bosses
  * ganondorf roll until. need small tweak
  * ganon- should actually be a normal choice rule. but do you redo the two mandatory spaces?
  * items
  * zone for leading player

Bugs:
* Overflow on player effects badges

Cleanup:
* Move game extensions to external modules?
* Remove multi dice rolls in one click. Not used and lots of overhead
* Alert state is a bit messy
* Extensions/non components need i18n support
* Actions now how a `ruleId` on them to indicate where they came from, this should be incorporated into the `Alert` component's logic as well so that all actions aren't grouped together
* `RollAugmentationRule` can easily be consolidated into `SpeedModifierRule`

Parity:
* Improve animation of moving. Only happens on the current player's screen
* Add back battle music?

New features:
* Rolls in an alert can have custom labels
* Add more display rule consequences to dice rolls rules
* Always present toolbarish thingy with
  * Panic button
  * Help/rules button
  * Donate link?
* Improve the player avatars. Maybe make them icons of the starter?

## Schema changes from v1
* TeleportRule is gone in favor of MoveRule with tileIndex
* ChoiceRule schema is different, choices array item will be an object with a "rule" key rather than the rule directly
* "any" diceRoll outcome is removed, and the former "any" rule is just listed as an outcome. This would work in the old version too
* `playerTarget` now a required field in `SpeedModifierRule`
* New rule types
  * `StarterSelectionRule`
  * `UpdateStarterRule`

## JSON structure
Too lazy to put together a proper schema, will eventually create one (maybe use https://app.quicktype.io/#l=schema). But overall the structure looks something like this. All fields mandatory unless otherwise specified.

```
{
  // List of objects representing the tiles on the board
  tiles: Tile[],

  // List of objects representing the zones in the board
  zones: Zone[]
}
```

### Tile
A tile represents an individual cell in the board the a player can navigate to.

```
{
  rule: Rule,
  position: Coordinate[]
}
```

#### Coordinate
A coordinate is meant to represent a single corner of a tile on the board image. Each corner coordinate is used by the engine to generate an average center point of the tile which is where the player avatar will be moved to.

```
{
  x: number,
  y: number
}
```

### Rule
A rule is a representation of what logic to execute when a user lands on a particular tile. There are many different types of rules.

```
{
  // The actual text on the image. This will pop up in a modal.
  displayText: string,

  // The rule type. See below for all types
  type: string/Enum,

  // See below. Depending on the rule type different properties are required.
  ...
}
```

#### DisplayRule
Displays text that can then be dismissed.
```
{
  type: "DisplayRule",
  displayText: string
}
```

#### ExtraTurnRule
Grants the player an extra turn immediately.
```
{
  type: "ExtraTurnRule",
  displayText: string,
}
```

#### MoveRule
Moves a player to a different space.

```
{
  type: "MoveRule",
  displayText: string,

  // "self", "custom", "allOthers"
  playerTarget: PlayerTarget,

  // If specified, moves selected player directly to this tile. Rule ignores all other properties if present.
  tileIndex: number,

  // Specify with either numSpaces or diceRolls
  direction: Direction, // "forward", "back"

  // Number of spaces to move
  numSpaces: number,

  // Player will move the roll total for the number of rolls specified
  diceRolls: {
    numRequired: number,
  }
}
```

#### RollUntilRule
Player rolls until their roll matches a number in the given criteria.
```
{
  type: "RollUntilRule",
  displayText: string,

  // The roll criteria. For example, [1, 2, 3] would mean the player rolls until they get a 1, 2 or 3
  criteria: number[],
}
```

#### AddMandatoryRule
One of the spaces on the board now becomes a mandatory stop for the player.
```
{
  type: "AddMandatoryRule",
  displayText: string,

  // The tile that becomes mandatory for the player
  tileIndex: number,
}
```

#### DiceRollRule
The player rolls a die a specified number of times, with or without rule outcomes.
```
{
  type: "DiceRollRule",
  displayText: string,

  diceRolls: {
    // The number of dice rolls required by the player
    numRequired: number,

    // "default", "cumulative", "allMatch"
    // Optional. Defaults to "default"
    type: DiceRollType,

    // List of outcomes for the dice rolls. Only add if the roll needs to do something
    outcomes: [{
      // The outcome rule to be executed
      rule: Rule,

      // The roll criterias
      criteria: number[],

      // Should the rule execute if any roll meets the criteria. Perhaps only used for the Gen1 Missingno square
      isAny: boolean
    }]
  }
}
```

#### GameOverRule
Meant for the last time on the board. Means the player has won the game.
```
{
  type: "GameOverRule",
  displayText: string,
}
```

#### DrinkDuringLostTurnsRule
The "SS Anne" rule. Roll two dice, lose `rolls[0]` turns and drink `rolls[1]` during each turn.
```
{
  type: "DrinkDuringLostTu",
  displayText: string,

  // Send it like this as is.
  diceRolls: {
    numRequired: 2
  }
}
```

#### ProxyRule
Executes a rule defined by the game extension and not the engine.
```
{
  type: "ProxyRule",
  displayText: string,

  // Corresponds to the rule ID provided in the extension
  proxyRuleId: string
}
```

#### ApplyMoveConditionRule
TODO
```
{
  type: "ApplyMoveConditio",
  displayText: string,
}
```

#### ChoiceRule
Player is presented with a multiple options of what rule to execute.
```
{
  type: "ChoiceRule",
  displayText: string,
  choices: [{
    rule: RuleSchema
  }, { ... }]
}
```

#### ReverseTurnOrderRule
Reverses the turn order in the game.
```
{
  type: "ReverseTurnOrderRule",
  displayText: string,
}
```

#### ChallengeRule
Basically a custom rule for Pokemon Gen 1. *Challenge someone to a chugging contest. First to finish gets an extra turn, last to finish loses a turn.* The "challenge" happens offline and the player selects the outcome.
```
{
  type: "ChallengeRule",
  displayText: string,
}
```

#### SkipTurnRule
Player loses their next turn(s).
```
{
  type: "SkipTurnRule",
  displayText: string,
  numTurns: number,
}
```

#### SpeedModifierRule
Affects the dice rolls of players in the game.
```
{
  type: "SpeedModifierRule",
  displayText: string,
  playerTarget: PlayerTarget,
  numTurns: number,
  modifier: [
    <one of "*", "-", "+">, number
  ]
}
```

#### SkipNextMandatoryRule
Allows the player to skip the next mandatory space(s). Note that if you land directly on a mandatory space you still must perform what it says.
```
{
  type: "SkipNextMandatoryRule",
  displayText: string,
  numSpaces: number
}
```

#### RollAugmentationRule
Todo

#### StarterSelectionRule
Meant to be used ONLY when the game starts. Placed on tile 0. Prompts a modal at the beginning of the game that each player is required to make a selection on. The first player must close the modal as it is technically their turn. The selection will be placed on the `starter` field in the player effects.
```
{
  type: "StarterSelectionRule",
  displayText: string,
  starters: string[]
}
```

#### UpdateStarterRule
Update the starter of the current player. Either uses `starters[0]` to hardcode the new starter, or a custom `playerTarget` which the player will swap with, so one of those must be provided.
```
{
  type: "UpdateStarterRule",
  displayText: string,
  starters?: string[],
  playerTarget?: "custom"
}
```

#### AnchorRule
Currently only used in Gen 2. The player who lands on this has their `anchors` effect incremented by one. An anchor means this player cannot be passed in a roll by another player, so during move calculation, if there is a player in your path with an anchor, you will go up until where they are and not pass. Mandatory skips do NOT factor into this calculation. You can provide multiple anchors (if you want to) with the `numTurns` property, but in 99% of cases you just want to set it to 1.
```
{
  type: "AnchorRule",
  displayText: string,
  numTurns: number
}
```

#### GroupRollRule
Currently only used in the Bug Catching Contest in Gen 2. Everyone rolls a die and nothing else happens.
```
{
  type: "GroupRollRule",
  displayText: string
}
```

### Other enums
#### PlayerTarget
Specifies a target player for a rule.
Possible values: `self`, `custom`, `allOthers`

### Zone
TODO

---