import { SQLElement } from "./SQLElement";
import { SQLParam } from "./SQLParam";
import { SQLElementType } from "./enums/SQLElementType";

/**
 * represents the where part of a sql query
 */
export class SQLWhere extends SQLElement {
  private readonly _condition: SQLElement;

  /**
   * @param condition
   */
  public constructor(condition?: SQLElement) {
    super();
    if (condition) {
      this._condition = condition;
    }
  }

  /**
   * returns the sql params (name-value pairs) for the where part
   */
  public getParameters(): SQLParam[] {
    let returnParams: SQLParam[] = [];

    returnParams = returnParams.concat(this._parameters);
    returnParams = returnParams.concat(this._condition.getParameters());

    return returnParams;
  }

  public getElementType(): number {
    return SQLElementType.SQLWhere;
  }

  /**
   * returns the sql string for the where part
   */
  public getSQL(): string {
    return "WHERE " + this._condition.getSQL();
  }

}
