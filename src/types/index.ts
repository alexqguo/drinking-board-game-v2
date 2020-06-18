export enum GameType {
  local = 'local',
  remote = 'remote',
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
  displayText: string,
  type: string,
  diceRolls: DiceRollSchema
  // more
}

export interface DiceRollSchema {
  numRequired: number,
  // Others
}

export interface ZoneSchema {
  name: string,
  type: ZoneType,
  rule: RuleSchema,
}

export enum ZoneType {
  passive = 'passive',
  active = 'active'
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
}

export interface Alert {
  open: boolean,
  ruleIdx: number,
  state: AlertState,
  diceRolls: AlertDiceRollInfo,
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
}

export enum TurnOrder {
  normal = 1,
  reverse = -1,
}

export interface Player {
  id: string,
  name: string,
  color: string,
  tileIndex: number,
  isActive?: boolean,
  effects: PlayerEffects,
}

export interface PlayerEffects {
  // mandatorySkips: number,
  // customMandatoryTiles: number[],
  extraTurns: number,
  skippedTurns: LostTurnInfo,
  // speedModifiers: SpeedModifier[],
  // moveCondition: MoveCondition,
  // anchors: number,
  // rollAugmentation: RollAugmentation,
}

export interface LostTurnInfo {
  message: string,
  numTurns: number,
}

export enum AppStage {
  dev = 'dev',
  prod = 'prod',
}

export interface Point {
  x: number,
  y: number,
}

export type RuleHandler = (rule: RuleSchema) => void;