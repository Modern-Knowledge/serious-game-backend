import { SQLAttributes } from "./sql/SQLAttributes";
import { SQLWhere } from "./sql/SQLWhere";
import { SQLJoin } from "./sql/SQLJoin";
import { SelectQuery } from "./sql/SelectQuery";
import { SQLSelect } from "./sql/SQLSelect";
import { SQLFrom } from "./sql/SQLFrom";
import { BakedQuery } from "./sql/BakedQuery";

export abstract class BaseFacade<EntityType, FilterType> {

  public getSQLAttributes(filter: FilterType): SQLAttributes {
    return new SQLAttributes();
  }

  private _tableName: string;
  private _tableAlias: string;
  private _attributes: string[];

  protected constructor(tableName: string, tableAlias: string) {
    this._tableName = tableName;
    this._tableAlias = tableAlias;
  }

  public select(attributes: SQLAttributes, joins: SQLJoin[], filter: FilterType): EntityType[] {
    const npq: SelectQuery = this.getSelectQuery(attributes, joins, this.getFilter(filter));

    const selectQuery: BakedQuery = npq.bake();

    let returnEntities: EntityType[] = [];

    // select statement

    console.log(selectQuery.getBakedSQL());

    returnEntities = this.postProcessSelect(returnEntities);

    return returnEntities;
  }

  public getSelectQuery(attributes: SQLAttributes, joins: SQLJoin[], where: SQLWhere): SelectQuery {
    const npq: SelectQuery = new SelectQuery();

    const select: SQLSelect = new SQLSelect(attributes);
    const from: SQLFrom = new SQLFrom(this._tableName, this._tableAlias);

    npq.sqlSelect = select;
    npq.sqlFrom = from;
    npq.addJoins(joins);
    npq.sqlWhere = where;

    return npq;
  }

  public abstract getFilter(filter: FilterType): SQLWhere;

  public postProcessSelect(entities: EntityType[]): EntityType[] {
    return entities;
  }

  public name(column: string): string {
    return column + this._tableAlias;
  }

  get tableName(): string {
    return this._tableName;
  }

  set tableName(value: string) {
    this._tableName = value;
  }

  get tableAlias(): string {
    return this._tableAlias;
  }

  set tableAlias(value: string) {
    this._tableAlias = value;
  }

  get attributes(): string[] {
    return this._attributes;
  }

  set attributes(value: string[]) {
    this._attributes = value;
  }
}
