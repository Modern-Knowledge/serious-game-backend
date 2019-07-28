import { SQLParam } from "./SQLParam";

/**
 * base class for all sql elements
 * every sql element has a list of parameters that have values
 */
export abstract class SQLElement {
  protected _parameters: SQLParam[] = [];

  /**
   * adds parameters to the list
   * @param param
   */
  public addParameter(param: SQLParam): void {
    this._parameters.push(param);
  }

  /**
   * returns the parameters
   */
  public getParameters(): SQLParam[] {
    return this._parameters;
  }

  /**
   * returns the sql element type
   */
  public abstract getElementType(): number;

  /**
   * returns the sql of the sql element
   */
  public abstract getSQL(): string;
}
