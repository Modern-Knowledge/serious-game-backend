import { SQLElement } from "./SQLElement";
import { SQLParam } from "./SQLParam";
import { SQLElementType } from "./SQLElementType";

export class SQLWhere extends SQLElement {
  private _condition: SQLElement;

  public constructor(condition?: SQLElement) {
    super();
    if (condition) {
      this._condition = condition;
    }
  }

  getParameters(): SQLParam[] {
    let returnParams: SQLParam[] = [];

    returnParams = returnParams.concat(this._parameters);
    returnParams = returnParams.concat(this._condition.getParameters());

    return returnParams;
  }

  get condition(): SQLElement {
    return this._condition;
  }

  set condition(value: SQLElement) {
    this._condition = value;
  }

  getElementType(): number {
    return SQLElementType.SQLWhere;
  }

  getSQL(): string {
    if (this._condition !== undefined) {
      return "WHERE " + this._condition.getSQL();
    }

    return "";
  }


}
