import { NamedParameterizedQuery } from "./NamedParameterizedQuery";
import { SQLSelect } from "./SQLSelect";
import { SQLFrom } from "./SQLFrom";
import { SQLJoin } from "./SQLJoin";
import { SQLWhere } from "./SQLWhere";
import { SQLParam } from "./SQLParam";
import { SQLOrderBy } from "./SQLOrderBy";

/**
 * represents a sql select statement
 *
 * e.g.: select %attributes% FROM %tablename% %tablealias% (%join%)? (WHERE %condition)? (ORDER BY %name% ASC|DESC)
 */
export class SelectQuery extends NamedParameterizedQuery {
  private _sqlSelect: SQLSelect;
  private _sqlFrom: SQLFrom;
  private _sqlJoins: SQLJoin[] = [];
  private _sqlWhere: SQLWhere;
  private _sqlOrderBy: SQLOrderBy[] = [];

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

    if (this._sqlOrderBy.length > 0) {
      returnSQL += " ORDER BY ";
      for (let i = 0; i < this._sqlOrderBy.length; i++) {
        returnSQL += this._sqlOrderBy[i].getSQL();
        returnSQL += (i === this._sqlOrderBy.length - 1) ? "" : ", ";
      }
    }

    return returnSQL;
  }

  set sqlSelect(value: SQLSelect) {
    this._sqlSelect = value;
  }

  set sqlFrom(value: SQLFrom) {
    this._sqlFrom = value;
  }

  set sqlWhere(value: SQLWhere) {
    this._sqlWhere = value;
  }

  set sqlOrderBy(value: SQLOrderBy[]) {
    this._sqlOrderBy = value;
  }
}
