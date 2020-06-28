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