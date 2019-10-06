/**
 * represents a sql parameter with a name and a value
 * e.g.: name = value
 */
export class SQLParam {
  private _name: string;
  private _value: string | number | Date | boolean;
  private _percQuotes: boolean = false;

  /**
   * @param name
   * @param value
   * @param percQuotes
   */
  public constructor(name: string, value: string | number | Date | boolean, percQuotes: boolean) {
    this._name = name;
    this._value = value;
    this._percQuotes = percQuotes;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get value(): string | number | Date | boolean {
    return this._value;
  }

  set value(value: string | number | Date | boolean) {
    this._value = value;
  }

  get percQuotes(): boolean {
    return this._percQuotes;
  }

  set percQuotes(value: boolean) {
    this._percQuotes = value;
  }
}
