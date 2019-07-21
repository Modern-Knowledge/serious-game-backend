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

 public fillParameters(stm: string): void {

 }

  getBakedSQL(): string {
    return this._sql;
  }

  private buildDictionary(params: SQLParam[]): void {
   let count: number = 1;

   const regexp: RegExp = new RegExp("::(.*?)::");
   const array: RegExpExecArray = regexp.exec(this._sql);

   if (array !== null) {
     for (const item of array) {
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

  private setNull(stm: string, index: number): void {

  }
}
