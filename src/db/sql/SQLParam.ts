/**
 * represents a sql parameter with a name and a value
 * e.g.: name = value
 */
export class SQLParam {
  private readonly _name: string;
  private readonly _value: any;
  private _percQuotes = false;

  /**
   * @param name
   * @param value
   * @param percQuotes
   */
  public constructor(name: string, value: any, percQuotes: boolean) {
    this._name = name;
    this._value = value;
    this._percQuotes = percQuotes;
  }

  get name(): string {
    return this._name;
  }

  get value(): any {
    return this._value;
  }

}
