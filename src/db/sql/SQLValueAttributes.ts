import { SQLAttributeCollection } from "./SQLAttributeCollection";
import { SQLValueAttribute } from "./SQLValueAttribute";
import { SQLParam } from "./SQLParam";

/**
 * handles interaction with the sql value attributes collection
 */
export class SQLValueAttributes extends SQLAttributeCollection<SQLValueAttribute> {

  public constructor() {
    super();
  }

  /**
   * returns string of comma separated parameter names
   * e.g.: ::id::, ::name::
   */
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

  /**
   * returns every sql param in the collection
   */
  public getSqlParams(): SQLParam[] {
    const returnParams: SQLParam[] = [];

    for (const currAttr of this._attributes) {
      returnParams.push(currAttr.getSQLParam());
    }

    return returnParams;
  }

  /**
   * returns a string with name = value pairs.
   * e.g.: name = "name", age = "12"
   */
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
