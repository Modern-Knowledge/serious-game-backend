import { SQLAttribute } from "./SQLAttribute";

/**
 * represents a collection of sql attributes
 */
export class SQLAttributeCollection<AttributeType extends SQLAttribute> {

  protected _attributes: AttributeType[] = [];

  /**
   * returns AttributeType by tableAlias and parameter name
   * @param tableAlias
   * @param name
   */
  public getByName(tableAlias: string, name: string): AttributeType {
    for (const currAttr of this._attributes) {
      if (currAttr.name === name && currAttr.tableAlias === tableAlias) {
        return currAttr;
      }
    }

    return undefined;
  }

  /**
   * adds an attribute to the collection
   * @param attribute
   */
  public addAttribute(attribute: AttributeType): void {
    this._attributes.push(attribute);
  }

  /**
   * adds multiple attributes to the collection
   * @param attributes
   */
  public addAttributes(attributes: AttributeType[]): void {
    this._attributes = this._attributes.concat(attributes);
  }

  /**
   * sets the tableAlias of every attribute in the collection
   * @param tableAlias
   */
  public setTableAlias(tableAlias: string): void {
    for (const currAttr of this._attributes) {
      currAttr.tableAlias = tableAlias;
    }
  }

  /**
   * return all attriattributesbutes
   */
  public getAttributes(): AttributeType[] {
    if (this._attributes !== undefined) {
      return this._attributes;
    }

    return undefined;
  }

  /**
   * returns a string of comma separated names
   * e.g.: id, name, ..
   */
  public getCommaSeparatedNamesUnaliased(): string {
    let returnSQL: string = "";

    for (const currAttribute of this._attributes) {
      returnSQL += currAttribute.getPrefixedName(false) + ", ";
    }

    if (returnSQL.length > 0) {
      returnSQL = returnSQL.substring(0, returnSQL.length - 2);
    }

    return returnSQL;
  }

  /**
   * returns a string of comma separated names with aliased name
   * e.g.: id as idu, name as nameu
   */
  public getCommaSeparatedNames(): string {
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
