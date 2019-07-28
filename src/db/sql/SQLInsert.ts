import { SQLElement } from "./SQLElement";
import { SQLParam } from "./SQLParam";
import { SQLValueAttributes } from "./SQLValueAttributes";
import { SQLElementType } from "./SQLElementType";
import { SQLValueAttribute } from "./SQLValueAttribute";
import { SQLBlock } from "./SQLBlock";

/**
 * represents the insert part of a sql query
 */
export class SQLInsert extends SQLElement {
  private _tableName: string;
  private _attributes: SQLValueAttributes;

  /**
   * @param tableName
   */
  public constructor(tableName: string) {
    super();
    this._tableName = tableName;
  }

  /**
   * returns the name-value parameters for the insert
   */
  public getParameters(): SQLParam[] {
    let returnParams: SQLParam[] = [];

    if (this._attributes !== undefined) {
      returnParams = returnParams.concat(this._attributes.getSqlParams());
    }

    return returnParams;
  }

  /**
   * returns the element type for the insert
   */
  public getElementType(): number {
    return SQLElementType.SQLInsert;
  }

  /**
   * returns the sql for the insert part of the query
   */
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
