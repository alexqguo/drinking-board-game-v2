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

export interface Board {
  name: string,
  value: string,
}

export interface SessionData {
  game: GameData,
  players: Player[],
}

export interface GameData {
  id: string,
  type: GameType,
  board: string,
  state: GameState,
  currentPlayerId: string,
}

export enum GameState {
  NOT_STARTED,
  GAME_START,
  TURN_CHECK, // Can the player take their turn
  TURN_START, // Start turn
  ZONE_CHECK, //
  ROLL_START,
  ROLL_END,
  MOVE_CALCULATE,
  MOVE_START,
  MOVE_END,
  RULE_TRIGGER,
  RULE_END,
  TURN_END,
  GAME_OVER,
  TURN_SKIP,
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