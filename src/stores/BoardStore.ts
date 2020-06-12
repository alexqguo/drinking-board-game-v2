import { BoardSchema } from 'src/types';

// Technically has no reason to use mobx right now
// It's all local and static data
export default class BoardStore {
  boardSchema: BoardSchema = {
    zones: [],
    tiles: []
  };

  setBoardSchema = (schema: BoardSchema) => {
    if (this.boardSchema.tiles.length) throw new Error('Schema already initialized');

    // Do mutations or whatever here
    this.boardSchema = schema;
  }
}