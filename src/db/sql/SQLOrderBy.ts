import { SQLElement } from "./SQLElement";
import { SQLElementType } from "./enums/SQLElementType";
import { SQLOrder } from "./enums/SQLOrder";

/**
 * represents the order by part of the sql query
 */
export class SQLOrderBy extends SQLElement {
  private readonly _attribute: string;
  private readonly _order: SQLOrder;
  private readonly _tableAlias: string;

  /**
   * @param attribute
   * @param order
   * @param tableAlias
   */
  public constructor(attribute: string, order: SQLOrder, tableAlias: string) {
    super();
    this._attribute = attribute;
    this._order = order;
    this._tableAlias = tableAlias;
  }

  /**
   * returns the element type for the order by
   */
  public getElementType(): number {
    return SQLElementType.SQLOrderBy;
  }

  /**
   * returns the sql string for the order by part
   */
  public getSQL(): string {
    return this._tableAlias + "." + this._attribute + " " + this._order;
  }
}
