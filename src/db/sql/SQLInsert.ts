import { SQLElement } from "./SQLElement";
import { SQLParam } from "./SQLParam";
import { SQLValueAttributes } from "./SQLValueAttributes";
import { SQLElementType } from "./SQLElementType";
import { SQLValueAttribute } from "./SQLValueAttribute";
import { SQLBlock } from "./SQLBlock";

export class SQLInsert extends SQLElement {
  private _tableName: string;
  private _attributes: SQLValueAttributes;

  constructor(tableName: string) {
    super();
    this._tableName = tableName;
  }

  public getParameters(): SQLParam[] {
    let returnParams: SQLParam[] = [];

    if (this._attributes !== undefined) {
      returnParams = returnParams.concat(this._attributes.getSqlParams());
    }

    return returnParams;
  }

  public getElementType(): number {
    return SQLElementType.SQLInsert;
  }

  public getSQL(): string {
    if (this._attributes === undefined) {
      return undefined;
    }

    const sqlAttributes: SQLValueAttribute[] = this._attributes.getAttributes();

    if (sqlAttributes === undefined || sqlAttributes.length === 0) {
      return undefined;
    }

    let returnString: string = "INSERT INTO " + this._tableName;

    const attributeBlock: SQLBlock = new SQLBlock();
    attributeBlock.addText(this._attributes.getCommaSeparatedNamesUnaliased());
    returnString += attributeBlock.getSQL() + " ";

    const valueBlock: SQLBlock = new SQLBlock();
    valueBlock.addText(this._attributes.getCommaSeparatedParameterName());
    returnString += "VALUES" + valueBlock.getSQL();

    return returnString;
  }

  get tableName(): string {
    return this._tableName;
  }

  set tableName(value: string) {
    this._tableName = value;
  }

  get attributes(): SQLValueAttributes {
    return this._attributes;
  }

  set attributes(value: SQLValueAttributes) {
    this._attributes = value;
  }
}
