import { SQLAttributeCollection } from "./SQLAttributeCollection";
import { SQLAttribute } from "./SQLAttribute";

/**
 * handles interaction with sql attribute collection
 */
export class SQLAttributes extends SQLAttributeCollection<SQLAttribute> {

  /**
   * @param tableAlias
   * @param attributes
   */
  public constructor(tableAlias?: string, attributes?: string[]) {
    super();

    if (attributes && tableAlias) {
      for (const currAttr of attributes) {
        this._attributes.push(new SQLAttribute(currAttr, tableAlias));
      }
    }
  }

  /**
   * adds an attribute to the collection
   * @param tableAlias
   * @param attribute
   */
  public addAnotherAttribute(tableAlias: string, attribute: string): void {
    this._attributes.push(new SQLAttribute(tableAlias, attribute));
  }

}
