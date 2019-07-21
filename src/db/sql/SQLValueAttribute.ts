import { SQLAttribute } from "./SQLAttribute";
import { SQLParam } from "./SQLParam";

export class SQLValueAttribute extends SQLAttribute {
  private _value: string;

  constructor(name: string, tableAlias: string, value: string) {
    super(name, tableAlias);
    this._value = value;
  }

  public getParamName(): string {
    return "__attr_" + this.name + "";
  }

  public getSQLParam(): SQLParam {
    return new SQLParam(this.getParamName(), this._value, false);
  }

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
