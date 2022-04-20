# Drinking board game v2

Parity:
* Finish rule implementations
  * With game engine turn calculation updates
* Zones
* Finish up remote games
* Make extensions compataible
* Improve animation of moving

Additional features:
* Rolls in an alert can have custom labels

Schema changes:
* TeleportRule is gone in favor of MoveRule with tileIndex
* ChoiceRule schema is different, choices array item will be an object with a "rule" key rather than the rule directly
* "any" diceRoll outcome is removed, and the former "any" rule is just listed as an outcome. This would work in the old version too
* Gen 1 Pikachu rule is now a ProxyRule

Cleanup:
* Move game extensions to external modules
* Better handling of creating/joining game
* Remove multi dice rolls in one click. Not used and lots of overhead
* Extensions need i18n support
* Replace alert.CAN_CLOSE with something like nextState to indicate what the next state of the game should be
* Can replace the proxy rules with a general StealPlayerEffect rule which provides a JSON key for the player effect, and either a custom player target to steal from, or hardcode it (for the Pikachu one in gen1)

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
Something
```
{
  type: "ApplyMoveConditio",
  displayText: string,
}
```

#### ChoiceRule
Something
```
{
  type: "ChoiceRule",
  displayText: string,
}
```

#### ReverseTurnOrderRule
Something
```
{
  type: "ReverseTurnOrderR",
  displayText: string,
}
```

#### ChallengeRule
Something
```
{
  type: "ChallengeRule",
  displayText: string,
}
```

#### SkipTurnRule
Something
```
{
  type: "SkipTurnRule",
  displayText: string,
}
```

#### SpeedModifierRule
Something
```
{
  type: "SpeedModifierRule",
  displayText: string,
}
```

#### SkipNextMandatoryRule
Something
```
{
  type: "SkipNextMandatory",
  displayText: string,
}
```

### Other enums
#### PlayerTarget
Specifies a target player for a rule.
Possible values: `self`, `custom`, `allOthers`

### Zone
asdf

---

Alert refactor
* instead of just being a big json of what the alert state is, use an action queue
* anything that any user can do is represented as an "action". alert store holds a list of actions
  *