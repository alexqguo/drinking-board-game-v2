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
  tiles: any,
  zones: any
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
}

export enum AppStage {
  dev = 'dev',
  prod = 'prod',
}

export interface Point {
  x: number,
  y: number,
}