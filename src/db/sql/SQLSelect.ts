import { SQLElement } from "./SQLElement";
import { SQLAttributes } from "./SQLAttributes";
import { SQLElementType } from "./SQLElementType";

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

  /**
   * returns the element type of a sql select
   */
  public getElementType(): number {
    return SQLElementType.SQLSelect;
  }

  /**
   * returns the sql string for the select part
   */
  public getSQL(): string {
    if (this._attributes === undefined) {
      return "";
    }
    return "SELECT " + this._attributes.getCommaSeparatedNames() + " ";
  }
}
