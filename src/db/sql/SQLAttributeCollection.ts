import { SQLAttribute } from "./SQLAttribute";
import { SQLValueAttribute } from "./SQLValueAttribute";

/**
 * represents a collection of sql attributes
 */
export class SQLAttributeCollection<AttributeType extends SQLAttribute> {

  protected _attributes: AttributeType[] = [];

  /**
   * adds an attribute to the collection
   * @param attribute
   */
  public addAttribute(attribute: AttributeType): void {
    if (attribute instanceof SQLValueAttribute && attribute.value === undefined) {
      return;
    }

    this._attributes.push(attribute);
  }

  /**
   * returns a string of comma separated names
   * e.g.: id, name, ..
   */
  public getCommaSeparatedNamesUnaliased(): string {
    let returnSQL = "";

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
    let returnSQL = "";

    for (const currAttribute of this._attributes) {
      returnSQL += currAttribute.getPrefixedName(false) + " AS " + currAttribute.getAliasName() + ", ";
    }

    if (returnSQL.length > 0) {
      returnSQL = returnSQL.substring(0, returnSQL.length - 2);
    }

    return returnSQL;
  }

}
