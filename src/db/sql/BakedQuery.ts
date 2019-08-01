import { NamedParameterizedQuery } from "./NamedParameterizedQuery";
import { SQLParam } from "./SQLParam";

/**
 * convert a prepared statement to a query that is supported by node/mysql
 */
export class BakedQuery {

  private _sql: string;
  private _dictionary: Map<number, string> = new Map<number, string>();
  private _values: Map<number, SQLParam> = new Map<number, SQLParam>();

  /**
   * @param npq
   */
  public constructor(npq: NamedParameterizedQuery) {
   this._sql = npq.getSql();
   this.buildDictionary(npq.getParameters());
  }

  /**
   * returns the parameters of a prepared statement as a list
   */
  public fillParameters(): (string | number)[] {
   const returnArr: (string | number)[] = [];

   this._values.forEach((value: SQLParam) => {
      if (value === undefined) {
        return;
      }

      returnArr.push(value.value);
   });

   return returnArr;
 }

  /**
   * returns the sql, where parameters are replaced with questionmarks
   */
  getBakedSQL(): string {
    return this._sql;
  }

  /**
   * adds the names of the parameters and the values of the parameters to the map
   * adds the values of the parameters to the _values map
   * @param params
   */
  private buildDictionary(params: SQLParam[]): void {
    let count: number = 1;
    const regexp: RegExp = new RegExp("::(.*?)::", "g");
    const array: RegExpMatchArray = this._sql.match(regexp);

    if (array !== null) {
      for (let item of array) {
        item = item.replace(new RegExp("::", "g"), "");
        this._dictionary.set(count, item);

        this._sql = this._sql.replace("::" + item + "::", "?");

        let value: SQLParam = undefined;
        for (const currParam of params) {
          if (currParam.name === item) {
            value = currParam;
          }
        }

        this._values.set(count, value);

        count++;
     }
    }
  }
}
