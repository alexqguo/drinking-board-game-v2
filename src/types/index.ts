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
}

export interface Player {
  id: string,
  name: string,
  color: string,
  isActive?: boolean,
}

export enum AppStage {
  dev = 'dev',
  prod = 'prod',
}