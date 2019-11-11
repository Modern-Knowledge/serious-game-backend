/**
 * represents a sql attribute with tableAlias and name
 * e.g.: tableAlias.name
 */
export class SQLAttribute {
  private readonly _tableAlias: string;
  private readonly _name: string;

  /**
   * @param name
   * @param tableAlias
   */
  public constructor(name: string, tableAlias?: string) {
    if (tableAlias) {
      this._tableAlias = tableAlias;
    }

    this._name = name;
  }

  /**
   * return name prefixed with tableAlias
   * @param withHighComas
   */
  public getPrefixedName(withHighComas: boolean): string {
    let retStr = "";

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

  /**
   * returns the alias name
   * e.g.: name + tableAlias
   */
  public getAliasName(): string {
    return this._name + this._tableAlias;
  }

  get name(): string {
    return this._name;
  }
}
