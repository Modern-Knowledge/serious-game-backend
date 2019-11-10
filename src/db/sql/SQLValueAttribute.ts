import { SQLAttribute } from "./SQLAttribute";
import { SQLParam } from "./SQLParam";

/**
 * represents a sql attribute that can hold a value
 */
export class SQLValueAttribute extends SQLAttribute {
  private readonly _value: string | number | Date | boolean;

  /**
   * @param name
   * @param tableAlias
   * @param value
   */
  public constructor(name: string, tableAlias: string, value: string | number | Date | boolean) {
    super(name, tableAlias);
    this._value = value;
  }

  /**
   * returns the placeholder for the value used in the query
   */
  public getParamName(): string {
    return "__attr_" + this.name + "";
  }

  /**
   * returns name-value pair of the sql value attribute
   */
  public getSQLParam(): SQLParam {
    return new SQLParam(this.getParamName(), this._value, false);
  }

  get value(): string | number | Date | boolean {
    return this._value;
  }
}
