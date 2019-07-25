import { NamedParameterizedQuery } from "./NamedParameterizedQuery";
import { SQLWhere } from "./SQLWhere";
import { SQLUpdate } from "./SQLUpdate";
import { SQLParam } from "./SQLParam";

export class UpdateQuery extends NamedParameterizedQuery {

  private _update: SQLUpdate;
  private _where: SQLWhere;

  public constructor() {
    super();
  }

  public getParameters(): SQLParam[] {
    let returnParams: SQLParam[] = [];

    if (this._update !== undefined) {
      returnParams = returnParams.concat(this._update.getParameters());
    }

    if (this._where !== undefined) {
      returnParams = returnParams.concat(this._where.getParameters());
    }

    return returnParams;
  }

  public getSql(): string {
    let returnStr: string = "";

    if (this._update !== undefined) {
      returnStr += this._update.getSQL() + " ";
    }

    if (this._where !== undefined) {
      returnStr += this._where.getSQL();
    }

    return returnStr;
  }

  get update(): SQLUpdate {
    return this._update;
  }

  set update(value: SQLUpdate) {
    this._update = value;
  }

  get where(): SQLWhere {
    return this._where;
  }

  set where(value: SQLWhere) {
    this._where = value;
  }
}
