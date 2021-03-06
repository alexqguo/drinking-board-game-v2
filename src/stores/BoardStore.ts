import { BoardSchema, RuleSchema, TileSchema, ZoneSchema } from 'src/types';

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

  // These are slow and bad
  getTileIndexForRule = (rule: RuleSchema) => this.schema.tiles.findIndex((t: TileSchema) => t.rule === rule);
  getIndexForZone = (zone: ZoneSchema) => this.schema.zones.findIndex((z: ZoneSchema) => z === zone);
}