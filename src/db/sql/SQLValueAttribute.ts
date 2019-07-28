import { SQLAttribute } from "./SQLAttribute";
import { SQLParam } from "./SQLParam";

/**
 * represents a sql attribute that can hold a value
 */
export class SQLValueAttribute extends SQLAttribute {
  private _value: string;

  /**
   * @param name
   * @param tableAlias
   * @param value
   */
  public constructor(name: string, tableAlias: string, value: string) {
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

  /**
   * performs a deep copy of the object and returns it
   */
  public copy(): SQLValueAttribute {
    return new SQLValueAttribute(this.name, this.tableAlias, this.value);
  }

  get value(): string {
    return this._value;
  }

  set value(value: string) {
    this._value = value;
  }
}
