import { NamedParameterizedQuery } from "./NamedParameterizedQuery";
import { SQLDelete } from "./SQLDelete";
import { SQLWhere } from "./SQLWhere";
import { SQLParam } from "./SQLParam";

/**
 * represents a sql delete statement
 *
 * e.g.: DELETE FROM %tablename% (WHERE condition)?
 */
export class DeleteQuery extends NamedParameterizedQuery {
  private _delete: SQLDelete;
  private _where: SQLWhere;

  public constructor() {
    super();
  }

  /**
   * returns the sql parameters (name-value pairs) for the delete query
   */
  public getParameters(): SQLParam[] {
    let returnParams: SQLParam[] = [];

    if (this._where !== undefined) {
      returnParams = returnParams.concat(this._where.getParameters());
    }

    return returnParams;
  }

  /**
   * returns the sql for delete query
   */
  public getSql(): string {
    let returnStr: string = "";

    if (this._delete !== undefined) {
      returnStr += this._delete.getSQL() + " ";
    }

    if (this._where !== undefined) {
      returnStr += this._where.getSQL();
    }

    return returnStr;
  }

  set delete(value: SQLDelete) {
    this._delete = value;
  }

  set where(value: SQLWhere) {
    this._where = value;
  }
}
