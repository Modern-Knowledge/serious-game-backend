import { SQLAttributeCollection } from "./SQLAttributeCollection";
import { SQLAttribute } from "./SQLAttribute";

export class SQLAttributes extends SQLAttributeCollection<SQLAttribute> {
  constructor(tableAlias?: string, attributes?: string[]) {
    super();

    if (attributes && tableAlias) {
      for (const currAttr of attributes) {
        this._attributes.push(new SQLAttribute(tableAlias, currAttr));
      }
    }
  }

  public addAttribute1(tableAlias: string, attribute: string): void {
    this._attributes.push(new SQLAttribute(tableAlias, attribute));
  }

  public addAttributes2(tableAlias: string, attributes: string[]): void {
    for (const currAttr of attributes) {
      this._attributes.push(new SQLAttribute(tableAlias, currAttr));
    }
  }


}
