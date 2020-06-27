export enum GameType {
  local = 'local',
  remote = 'remote',
}

export interface GameExtensionInfo {
  gameEvents: { [key: string]: Function },
}

export interface CreateGameOptions {
  playerNames: string[],
  // localPlayer: string,
  gameType: GameType,
  board: Board
}

export interface RestoreGameOptions {
  localPlayerId: string,
  gameId: string,
  board: string,
}

export interface Board {
  name: string,
  value: string,
}

export interface SessionData {
  game: GameData,
  players: Player[],
  alert: Alert
}

export interface GameData {
  id: string,
  type: GameType,
  board: string,
  state: GameState,
  currentPlayerId: string,
  currentRoll: number | null,
  turnOrder: TurnOrder,
}

export interface Alert {
  open: boolean,
  ruleIdx: number,
  ruleType: AlertRuleType,
  state: AlertState,
  diceRolls: AlertDiceRollInfo,
  playerSelection: AlertPlayerSelection,
  choice: AlertChoiceInfo,
  messageOverride: string,
  outcomeIdentifier: string,
}

export enum AlertRuleType {
  rule = 'rule',
  zone = 'zone',
}

export enum AlertState {
  CLOSED = 'CLOSED',
  PENDING = 'PENDING',
  CAN_CLOSE = 'CAN_CLOSE',
  REQUIRE_ACTION = 'REQUIRE_ACTION',
}

export type AlertDiceRollInfo = { 
  [key: string]: AlertDiceRoll,
};

export interface AlertDiceRoll {
  numRolls: number,
  result: string // pipe separated string
}

export interface AlertPlayerSelection {
  isRequired: boolean,
  selectedId: string, // Currently only support selecting one player
  candidateIds: string[]
}

export interface AlertChoiceInfo {
  [key: string]: AlertChoice
}

export interface AlertChoice {
  displayText: string,
  isSelected: boolean,
}

export enum GameState {
  NOT_STARTED = 'NOT_STARTED',
  GAME_START = 'GAME_START',
  TURN_CHECK = 'TURN_CHECK',
  ZONE_CHECK = 'ZONE_CHECK',
  TURN_START = 'TURN_START',
  ROLL_START = 'ROLL_START',
  ROLL_END = 'ROLL_END',
  MOVE_CALCULATE = 'MOVE_CALCULATE',
  MOVE_START = 'MOVE_START',
  MOVE_END = 'MOVE_END',
  RULE_TRIGGER = 'RULE_TRIGGER',
  RULE_END = 'RULE_END',
  TURN_END = 'TURN_END',
  GAME_OVER = 'GAME_OVER',
  TURN_SKIP = 'TURN_SKIP',
  LOST_TURN_START = 'LOST_TURN_START',
}

export enum TurnOrder {
  normal = 1,
  reverse = -1,
}

export interface Player {
  id: string,
  name: string,
  tileIndex: number,
  hasWon: boolean,
  isActive?: boolean,
  effects: PlayerEffects,
}

export interface PlayerEffects {
  mandatorySkips: number,
  customMandatoryTileIndex: number,
  extraTurns: number,
  skippedTurns: LostTurnInfo,
  speedModifier: SpeedModifier,
  moveCondition: MoveCondition,
  // anchors: number,
  // rollAugmentation: RollAugmentation,
}

export interface LostTurnInfo {
  message: string,
  numTurns: number,
}

export interface MoveCondition {
  tileIndex: number, // This is the condition of the rule located at tileIndex
  numCurrentSuccesses: number,
}

export interface MoveConditionResult {
  canMove: boolean,
  message: string,
}

export enum AppStage {
  dev = 'dev',
  prod = 'prod',
}

export interface Point {
  x: number,
  y: number,
}

export interface SpeedModifier {
  operation: ModifierOperation,
  modifier: number,
  numTurns: number,
}

export type RuleHandler = (rule: RuleSchema) => void;

////////////////////////////////////////////////////////////////
// Schema interfaces. Anything living in the board JSON files
////////////////////////////////////////////////////////////////
export interface BoardSchema {
  tiles: TileSchema[],
  zones: ZoneSchema[],
}

export interface TileSchema {
  mandatory?: boolean,
  rule: RuleSchema,
  position: Point[],
  zone?: string,
}

export interface RuleSchema {
  type: string,
  displayText: string,
  diceRolls?: DiceRollSchema
  numTurns?: number
  playerTarget?: PlayerTarget
  modifier?: [ModifierOperation, number]
  criteria?: number[],
  numSpaces?: number,
  tileIndex?: number,
  direction?: Direction,
  choices?: ChoiceSchema[],
  condition?: MoveConditionSchema,
  proxyRuleId?: string,
}

export interface BaseOutcomeSchema {
  rule: RuleSchema
}

export interface DiceRollSchema {
  outcomes?: OutcomeSchema[],
  numRequired: number,
  cumulative?: boolean,
  type: DiceRollType
}

export interface ChoiceSchema extends BaseOutcomeSchema {}

export interface OutcomeSchema extends BaseOutcomeSchema {
  criteria: number[],
}

export interface ZoneSchema {
  name: string,
  type: ZoneType,
  rule: RuleSchema,
}

export interface MoveConditionSchema {
  criteria: number[],
  numSuccessesRequired: number,
  immediate?: boolean,
  consequence: RuleSchema,
  description: string,
  diceRolls?: DiceRollSchema,
}

////////////////////////////////////////////////////////////////
// Shared between both schemas and engine code
////////////////////////////////////////////////////////////////
export enum ModifierOperation {
  addition = '+',
  multiplication = '*',
  subtraction = '-',
  equal = '=',
}

export enum PlayerTarget {
  custom = 'custom',
  self = 'self',
  allOthers = 'allOthers',
}

export enum ZoneType {
  passive = 'passive',
  active = 'active'
}

export enum Direction {
  forward = 'forward',
  back = 'back'
}

export enum DiceRollType {
  cumulative = 'cumulative',
  default = 'default',
  allMatch = 'allMatch',
}