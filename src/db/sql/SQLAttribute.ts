export class SQLAttribute {
  private _tableAlias: string;
  private _name: string;

  constructor(name: string, tableAlias?: string) {
    if (tableAlias) {
      this._tableAlias = tableAlias;
    }

    this._name = name;
  }

  get tableAlias(): string {
    return this._tableAlias;
  }

  set tableAlias(value: string) {
    this._tableAlias = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  public getPrefixedName(withHighComas: boolean): string {
    let retStr: string = "";

    if (this._tableAlias !== undefined && (this._tableAlias.length > 0)) {
      retStr += this._tableAlias + ".";
    }

    if (this._name !== undefined && (this._name.length > 0)) {
      if (withHighComas) {
        retStr += "`" + this._name + "`";
      } else {
        retStr += this._name;
      }
    }

    return retStr;
  }

  public getAliasName(): string {
    return this._name + this._tableAlias;
  }
}
