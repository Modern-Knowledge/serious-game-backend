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
    const returnParams: SQLParam[] = [];

    returnParams.concat(this._parameters);
    returnParams.concat(this._condition.getParameters());

    return super.getParameters();
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
