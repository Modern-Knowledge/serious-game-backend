import { SQLElement } from "./SQLElement";
import { SQLValueAttributes } from "./SQLValueAttributes";
import { SQLParam } from "./SQLParam";
import { SQLElementType } from "./SQLElementType";

export class SQLUpdate extends SQLElement {

  private _tableName: string;
  private _tableAlias: string;
  private _attributes: SQLValueAttributes;

  constructor(tableName: string, tableAlias: string) {
    super();
    this._tableName = tableName;
    this._tableAlias = tableAlias;
  }

  public getParameters(): SQLParam[] {
    let returnParams: SQLParam[] = [];

    if (this._attributes !== undefined) {
      returnParams = returnParams.concat(this._attributes.getSqlParams());
    }

    return returnParams;
  }

  get tableName(): string {
    return this._tableName;
  }

  set tableName(value: string) {
    this._tableName = value;
  }

  get tableAlias(): string {
    return this._tableAlias;
  }

  set tableAlias(value: string) {
    this._tableAlias = value;
  }

  get attributes(): SQLValueAttributes {
    return this._attributes;
  }

  set attributes(value: SQLValueAttributes) {
    this._attributes = value;
  }

  public getElementType(): number {
    return SQLElementType.SQLUpdate;
  }

  public getSQL(): string {
    if (this._attributes.getAttributes().length <= 0) {
      return undefined;
    }

    let returnStr: string = "UPDATE " + this._tableName + " " + this._tableAlias + " SET ";
    returnStr += this._attributes.getNameParamNamePairs();

    return returnStr;
  }
}
