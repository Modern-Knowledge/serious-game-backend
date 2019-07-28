import { NamedParameterizedQuery } from "./NamedParameterizedQuery";
import { SQLSelect } from "./SQLSelect";
import { SQLFrom } from "./SQLFrom";
import { SQLJoin } from "./SQLJoin";
import { SQLWhere } from "./SQLWhere";
import { SQLParam } from "./SQLParam";

/**
 * represents a sql select statement
 *
 * e.g.: select %attributes% FROM %tablename% %tablealias% (%join%)? (WHERE %condition)?
 */
export class SelectQuery extends NamedParameterizedQuery {
  private _sqlSelect: SQLSelect;
  private _sqlFrom: SQLFrom;
  private _sqlJoins: SQLJoin[] = [];
  private _sqlWhere: SQLWhere;

  public constructor() {
    super();
  }

  /**
   * returns the parameters (name-value pairs) for the select query
   */
  public getParameters(): SQLParam[] {
    let returnParams: SQLParam[] = [];

    if (this._sqlSelect !== undefined) {
      returnParams = returnParams.concat(this._sqlSelect.getParameters());
    }

    if (this._sqlFrom !== undefined) {
      returnParams = returnParams.concat(this._sqlFrom.getParameters());
    }

    for (const item of this._sqlJoins) {
      returnParams = returnParams.concat(item.getParameters());
    }

    if (this._sqlWhere !== undefined) {
      returnParams = returnParams.concat(this._sqlWhere.getParameters());
    }

    return returnParams;
  }

  /**
   * adds a new join to the list
   * @param join
   */
  public addJoin(join: SQLJoin): void {
    if (join !== undefined) {
      this._sqlJoins.push(join);
    }
  }

  /**
   * adds a list of new joins to the list
   * @param joins
   */
  public addJoins(joins: SQLJoin[]): void {
    if (joins !== undefined) {
      this._sqlJoins = this._sqlJoins.concat(joins);
    }
  }

  /**
   * returns the sql for the select query
   */
  public getSql(): string {
    let returnSQL: string = "";
    if (this._sqlSelect !== undefined)
      returnSQL += this._sqlSelect.getSQL();

    if (this._sqlFrom !== undefined)
      returnSQL += this._sqlFrom.getSQL();

    for (const currJoin of this._sqlJoins) {
      returnSQL += currJoin.getSQL();
    }

    if (this._sqlWhere !== undefined) {
      let where: string = this._sqlWhere.getSQL();
      if (where.length < 10) {
        where = "";
      }
      returnSQL += where;
    }

    return returnSQL;
  }

  get sqlSelect(): SQLSelect {
    return this._sqlSelect;
  }

  set sqlSelect(value: SQLSelect) {
    this._sqlSelect = value;
  }

  get sqlFrom(): SQLFrom {
    return this._sqlFrom;
  }

  set sqlFrom(value: SQLFrom) {
    this._sqlFrom = value;
  }

  get sqlJoins(): SQLJoin[] {
    return this._sqlJoins;
  }

  set sqlJoins(value: SQLJoin[]) {
    this._sqlJoins = value;
  }

  get sqlWhere(): SQLWhere {
    return this._sqlWhere;
  }

  set sqlWhere(value: SQLWhere) {
    this._sqlWhere = value;
  }
}
