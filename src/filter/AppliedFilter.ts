export class AppliedFilter {
  private _params: string[] = [];
  private _wheres: string[] = [];

  public addParam(param: string, name: string, tableAlias: string) {
    this._params.push(param);
    this._wheres.push(`${tableAlias}.${name} = ?`);
  }

  get params(): string[] {
    return this._params;
  }

  getWhereString(): string {
    return ((this._wheres.length > 0) ? "WHERE " : "") + this._wheres.join(" AND ");
  }
}
