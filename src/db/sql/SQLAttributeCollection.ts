import { SQLAttribute } from "./SQLAttribute";

export class SQLAttributeCollection<AttributeType extends SQLAttribute> {

  protected _attributes: AttributeType[] = [];

  public getByName(tableAlias: string, name: string): AttributeType {
    for (const currAttr of this._attributes) {
      if (currAttr.name === name && currAttr.tableAlias === tableAlias) {
        return currAttr;
      }
    }

    return undefined;
  }

  public addAttribute(attribute: AttributeType): void {
    this._attributes.push(attribute);
  }

  public addAttributes(attributes: AttributeType[]): void {
    this._attributes.concat(attributes);
  }

  public setTableAlias(tableAlias: string): void {
    for (const currAttr of this._attributes) {
      currAttr.tableAlias = tableAlias;
    }
  }

  public getAttributes(): AttributeType[] {
    if (this._attributes !== undefined) {
      return this._attributes;
    }

    return undefined;
  }

  public remove(tableAlias: string, name: string): void {
    if (name === undefined || tableAlias === undefined) {
      return;
    }

    this._attributes.forEach((item: AttributeType, index: number) => {
      if (item.name == name && item.tableAlias === tableAlias) {
          this._attributes.splice(index, 1);
      }
    });
  }

  public getCommaSeperatedNamesUnaliased(): string {
    let returnSQL: string = "";

    for (const currAttribute of this._attributes) {
      returnSQL += currAttribute.getPrefixedName(false) + ", ";
    }

    if (returnSQL.length > 0) {
      returnSQL = returnSQL.substring(0, returnSQL.length - 2);
    }

    return returnSQL;
  }

  public getCommaSeperatedNames() {
    let returnSQL: string = "";


    for (const currAttribute of this._attributes) {
      returnSQL += currAttribute.getPrefixedName(false) + " AS " + currAttribute.getAliasName() + ", ";
    }

    if (returnSQL.length > 0) {
      returnSQL = returnSQL.substring(0, returnSQL.length - 2);
    }

    return returnSQL;
  }


}
