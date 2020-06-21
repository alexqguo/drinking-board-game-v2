import { BoardSchema, RuleSchema, TileSchema } from 'src/types';

// Technically has no reason to use mobx right now
// It's all local and static data
export default class BoardStore {
  schema: BoardSchema = {
    zones: [],
    tiles: []
  };

  setBoardSchema = (schema: BoardSchema) => {
    if (this.schema.tiles.length) throw new Error('Schema already initialized');

    // Do mutations or whatever here
    this.schema = schema;
  }

  // This is slow and bad
  getTileIndexForRule = (rule: RuleSchema) => this.schema.tiles.findIndex((t: TileSchema) => t.rule === rule);
}