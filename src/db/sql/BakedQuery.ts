import { NamedParameterizedQuery } from "./NamedParameterizedQuery";
import { SQLParam } from "./SQLParam";

export class BakedQuery {
  private _sql: string;
  private _dictionary: Map<number, string> = new Map<number, string>();
  private _values: Map<number, SQLParam> = new Map<number, SQLParam>();

 public constructor(npq: NamedParameterizedQuery) {
   this._sql = npq.getSql();
   this.buildDictionary(npq.getParameters());
 }

 public fillParameters(): string[] {
   const returnArr: string[] = [];

   this._values.forEach((value: SQLParam, key: number) => {
      if (value === undefined) {
        return;
      }

      returnArr.push(value.value);
   });

   return returnArr;
 }

  getBakedSQL(): string {
    return this._sql;
  }

  private buildDictionary(params: SQLParam[]): void {
   let count: number = 1;

   const regexp: RegExp = new RegExp("::(.*?)::", "g");
   const array: RegExpMatchArray = this._sql.match(regexp);

     for (let item of array) {
       this._dictionary.set(count, item);

       item = item.replace(new RegExp("::", "g"), "");
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
