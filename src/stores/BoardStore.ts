import { BoardSchema } from 'src/types';

// Technically has no reason to use mobx
// It's all local and static data
export default class BoardStore {
  boardSchema: BoardSchema = {
    zones: [],
    tiles: []
  };

  setBoardSchema = (schema: BoardSchema) => {
    this.boardSchema = schema;
  }
}