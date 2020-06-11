export enum GameType {
  local = 'local',
  remote = 'remote',
}

export interface CreateGameOptions {
  playerNames: string[],
  // localPlayer: string,
  gameType: GameType,
}

console.log('asdf');