import { NamedParameterizedQuery } from "./NamedParameterizedQuery";
import { SQLDelete } from "./SQLDelete";
import { SQLWhere } from "./SQLWhere";
import { SQLParam } from "./SQLParam";

export class DeleteQuery extends NamedParameterizedQuery {
  private _delete: SQLDelete;
  private _where: SQLWhere;

  public constructor() {
    super();
  }


  public getParameters(): SQLParam[] {
    let returnParams: SQLParam[] = [];

    if (this._where !== undefined) {
      returnParams = returnParams.concat(this._where.getParameters());
    }

    return returnParams;
  }

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


  get delete(): SQLDelete {
    return this._delete;
  }

  set delete(value: SQLDelete) {
    this._delete = value;
  }

  get where(): SQLWhere {
    return this._where;
  }

  set where(value: SQLWhere) {
    this._where = value;
  }
}
