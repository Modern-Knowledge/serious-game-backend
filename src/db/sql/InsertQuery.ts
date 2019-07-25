import { NamedParameterizedQuery } from "./NamedParameterizedQuery";
import { SQLInsert } from "./SQLInsert";
import { SQLParam } from "./SQLParam";

export class InsertQuery extends NamedParameterizedQuery {
  private _insert: SQLInsert;

  constructor(insert?: SQLInsert) {
    super();

    this._insert = insert;
  }

  public getParameters(): SQLParam[] {
    let returnParams: SQLParam[] = [];

    if (this._insert !== undefined) {
      returnParams = returnParams.concat(this._insert.getParameters());
    }

    return returnParams;
  }

  get insert(): SQLInsert {
    return this._insert;
  }

  set insert(value: SQLInsert) {
    this._insert = value;
  }

  public getSql(): string {
    let returnSql: string = "";

    if (this._insert !== undefined) {
      returnSql += this._insert.getSQL();
    }

    return returnSql;
  }
}
