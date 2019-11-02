import { NamedParameterizedQuery } from "./NamedParameterizedQuery";
import { SQLInsert } from "./SQLInsert";
import { SQLParam } from "./SQLParam";

/**
 * represents a sql insert query
 *
 * e.g.: INSERT INTO %tablename% (%attributes%) VALUES (%values%)
 */
export class InsertQuery extends NamedParameterizedQuery {
  private _insert: SQLInsert;

  /**
   * @param insert
   */
  public constructor(insert?: SQLInsert) {
    super();

    this._insert = insert;
  }

  /**
   * returns the sql parameters (name-value pairs) for the insert query
   */
  public getParameters(): SQLParam[] {
    let returnParams: SQLParam[] = [];

    if (this._insert !== undefined) {
      returnParams = returnParams.concat(this._insert.getParameters());
    }

    return returnParams;
  }

  /**
   * returns the sql for the insert query
   */
  public getSql(): string {
    let returnSql: string = "";

    if (this._insert !== undefined) {
      returnSql += this._insert.getSQL();
    }

    return returnSql;
  }

  set insert(value: SQLInsert) {
    this._insert = value;
  }
}
