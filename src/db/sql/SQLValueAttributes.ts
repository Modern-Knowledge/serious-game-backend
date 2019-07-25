import { SQLAttributeCollection } from "./SQLAttributeCollection";
import { SQLValueAttribute } from "./SQLValueAttribute";
import { SQLParam } from "./SQLParam";

export class SQLValueAttributes extends SQLAttributeCollection<SQLValueAttribute> {

  constructor() {
    super();
  }

  public setAllValuesUndefined(): void {
    for (const currAttr of this._attributes) {
      currAttr.value = undefined;
    }
  }

  public getCommaSeparatedParameterName(): string {
    let returnSql: string = "";

    for (const currAttribute of this._attributes) {
      returnSql += "::" + currAttribute.getParamName() + "::, ";
    }

    if (returnSql.length > 0) {
      returnSql = returnSql.substring(0, returnSql.length - 2);
    }

    return returnSql;
  }

  public getSqlParams(): SQLParam[] {
    const returnParams: SQLParam[] = [];

    for (const currAttr of this._attributes) {
      returnParams.push(currAttr.getSQLParam());
    }

    return returnParams;
  }


  public getNameParamNamePairs(): string {
    let returnSql: string = "";

    for (const currAttribute of this._attributes) {
      returnSql += currAttribute.getPrefixedName(true) + " = ::" + currAttribute.getParamName() + "::, ";
    }

    if (returnSql.length > 0) {
      returnSql = returnSql.substring(0, returnSql.length - 2);
    }

    return returnSql;
  }

}
