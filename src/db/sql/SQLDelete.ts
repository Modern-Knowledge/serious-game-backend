import { SQLElement } from "./SQLElement";
import { SQLElementType } from "./SQLElementType";

export class SQLDelete extends SQLElement {

  private _tableName: string;
  private _tableAlias: string;

  constructor(tableName: string, tableAlias: string) {
    super();
    this._tableName = tableName;
    this._tableAlias = tableAlias;
  }

  get tableName(): string {
    return this._tableName;
  }

  set tableName(value: string) {
    this._tableName = value;
  }

  public getElementType(): number {
    return SQLElementType.SQLDelete;
  }

  public getSQL(): string {
    return "DELETE FROM " + this._tableName;
  }
}
