import { SQLAttributeCollection } from "./SQLAttributeCollection";
import { SQLValueAttribute } from "./SQLValueAttribute";

export class SQLValueAttributes extends SQLAttributeCollection<SQLValueAttribute> {

  constructor() {
    super();
  }

  public setAllValuesundefined(): void {
    for (const currAttr of this._attributes) {
      currAttr.value = undefined;
    }
  }

}
