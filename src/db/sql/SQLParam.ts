export class SQLParam {
  private _name: string = "";
  private _value: string;
  private _percQuotes: boolean = false;
  private _valueType: string;

  constructor(name: string, value: string, percQuotes: boolean, valueType: string) {
    this._name = name;
    this._value = value;
    this._percQuotes = percQuotes;
    this._valueType = valueType;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get value(): string {
    return this._value;
  }

  set value(value: string) {
    this._value = value;
  }

  get percQuotes(): boolean {
    return this._percQuotes;
  }

  set percQuotes(value: boolean) {
    this._percQuotes = value;
  }
}
