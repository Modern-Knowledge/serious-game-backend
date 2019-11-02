import { SQLElement } from "./SQLElement";
import { SQLAttributes } from "./SQLAttributes";
import { SQLElementType } from "./enums/SQLElementType";

/**
 * represents the select part of a sql query
 */
export class SQLSelect extends SQLElement {
  private readonly _attributes: SQLAttributes;

  /**
   * @param attributes
   */
  public constructor(attributes: SQLAttributes) {
    super();
    this._attributes = attributes;
  }

  public getElementType(): number {
    return SQLElementType.SQLSelect;
  }

  /**
   * returns the sql string for the select part
   */
  public getSQL(): string {
    return "SELECT " + this._attributes.getCommaSeparatedNames() + " ";
  }
}
