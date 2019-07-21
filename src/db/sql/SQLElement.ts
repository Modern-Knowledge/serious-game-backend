import { SQLParam } from "./SQLParam";

export abstract class SQLElement {
  protected _parameters: SQLParam[] = [];

  public addParameter(param: SQLParam): void {
    this._parameters.push(param);
  }

  public getParameters(): SQLParam[] {
    return this._parameters;
  }

  public abstract getElementType(): number;
  public abstract getSQL(): string;
}
