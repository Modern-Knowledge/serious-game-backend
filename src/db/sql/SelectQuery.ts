import { NamedParameterizedQuery } from "./NamedParameterizedQuery";
import { SQLSelect } from "./SQLSelect";
import { SQLFrom } from "./SQLFrom";
import { SQLJoin } from "./SQLJoin";
import { SQLWhere } from "./SQLWhere";
import { SQLParam } from "./SQLParam";

export class SelectQuery extends NamedParameterizedQuery {
  private _sqlSelect: SQLSelect;
  private _sqlFrom: SQLFrom;
  private _sqlJoins: SQLJoin[] = [];
  private _sqlWhere: SQLWhere;

  constructor() {
    super();
  }

  public getParameters(): SQLParam[] {
    const returnParams: SQLParam[] = [];

    if (this._sqlSelect !== undefined) {
      returnParams.concat(this._sqlSelect.getParameters());
    }

    if (this._sqlFrom !== undefined) {
      returnParams.concat(this._sqlFrom.getParameters());
    }

    for (const item of this._sqlJoins) {
      returnParams.concat(item.getParameters());
    }

    if (this._sqlWhere !== undefined) {
      returnParams.concat(this._sqlWhere.getParameters());
    }

    return returnParams;
  }

  public addJoin(join: SQLJoin): void {
    if (join !== undefined) {
      this._sqlJoins.push(join);
    }
  }

  public addJoins(joins: SQLJoin[]): void {
    if (joins !== undefined) {
      this._sqlJoins.concat(joins);
    }
  }


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
