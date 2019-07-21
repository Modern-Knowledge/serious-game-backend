import { SQLAttributeCollection } from "./SQLAttributeCollection";
import { SQLAttribute } from "./SQLAttribute";

export class SQLAttributes extends SQLAttributeCollection<SQLAttribute> {
  constructor(tableAlias?: string, attributes?: string[]) {
    super();

    if (attributes && tableAlias) {
      for (const currAttr of attributes) {
        this._attributes.push(new SQLAttribute(currAttr, tableAlias));
      }
    }
  }

  public addAnotherAttribute(tableAlias: string, attribute: string): void {
    this._attributes.push(new SQLAttribute(tableAlias, attribute));
  }


}
