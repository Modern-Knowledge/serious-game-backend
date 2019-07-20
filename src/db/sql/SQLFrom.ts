import { SQLElement } from "./SQLElement";
import { SQLElementType } from "./SQLElementType";

export class SQLFrom extends SQLElement {

  private readonly _tableName: string;
  private readonly _tableAlias: string;

  constructor(tableName: string, tableAlias: string) {
    super();
    this._tableName = tableName;
    this._tableAlias = tableAlias;
  }

  public getElementType(): number {
    return SQLElementType.SQLFrom;
  }

  public getSQL(): string {
    let returnSQL: string = "";

    if (this._tableName !== undefined && (!(this._tableName.length === 0))) {
      returnSQL += "FROM " + this._tableName + " ";
    }

    if (this._tableAlias !== undefined && (!(this._tableAlias.length === 0))) {
      returnSQL += "AS " + this._tableAlias + " ";
    }

    return returnSQL;
  }
}
