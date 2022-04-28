import {
  BoardSchema,
  RuleSchema,
  TileSchema,
  ZoneSchema,
} from 'src/types';

// Technically has no reason to use mobx right now
// It's all local and static data
export default class BoardStore {
  rulesById: Map<string, RuleSchema> = new Map();
  schema: BoardSchema = {
    zones: [],
    tiles: []
  };

  setBoardSchema = (schema: BoardSchema) => {
    if (this.schema.tiles.length) throw new Error('Schema already initialized');

    const decorateRuleIds = (rule: RuleSchema, baseId: string) => {
      rule.id = baseId;
      this.rulesById.set(baseId, rule);

      const childRules = [
        ...rule.choices?.map(c => c.rule) || [],
        ...rule.diceRolls?.outcomes?.map(o => o.rule) || [],
      ];
      childRules.forEach((childRule, i) => {
        decorateRuleIds(childRule, `${baseId}_${i}`);
      });
    };

    // Do mutations or whatever here
    this.schema = schema;

    this.schema.tiles.forEach((t: TileSchema, i: number) => {
      decorateRuleIds(t.rule, `rule_${i}`);
    });
    this.schema.zones.forEach((z: ZoneSchema, i: number) => {
      decorateRuleIds(z.rule, `zone_rule_${i}`);
    });
  }

  // These are slow and bad
  getTileIndexForRule = (rule: RuleSchema) => this.schema.tiles.findIndex((t: TileSchema) => t.rule === rule);
  getIndexForZone = (zone: ZoneSchema) => this.schema.zones.findIndex((z: ZoneSchema) => z === zone);
}