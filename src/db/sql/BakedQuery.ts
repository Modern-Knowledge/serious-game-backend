import { NamedParameterizedQuery } from "./NamedParameterizedQuery";
import { SQLParam } from "./SQLParam";

/**
 * Parse a prepared statement to a query that is supported by node/mysql.
 */
export class BakedQuery {

    private _sql: string;
    private _dictionary: Map<number, string> = new Map<number, string>();
    private _values: Map<number, SQLParam> = new Map<number, SQLParam>();

    /**
     * @param npq query that should be converted
     */
    public constructor(npq: NamedParameterizedQuery) {
        this._sql = npq.getSql();
        this.buildDictionary(npq.getParameters());
    }

    /**
     * Retrieves the values of the parameters that should be replaced as a list.
     * Get the values that are later injected into the query.
     */
    public fillParameters(): any[] {
        const returnArr: any[] = [];

        this._values.forEach((value: SQLParam) => {
            returnArr.push(value.value);
        });

        return returnArr;
    }

    /**
     * Returns the sql, where parameters the parameters are replaced with questionmarks.
     */
    public getBakedSQL(): string {
        return this._sql;
    }

    /**
     * Adds the names of the parameters and the values of the parameters to the map.
     * Adds the values of the parameters to the _values map.
     *
     * @param params values for the params
     */
    private buildDictionary(params: SQLParam[]): void {
        let count = 1;
        const regexp: RegExp = new RegExp("::(.*?)::", "g");
        const array: RegExpMatchArray = this._sql.match(regexp);

        if (array !== null) {
            for (let item of array) {
                item = item.replace(new RegExp("::", "g"), "");
                this._dictionary.set(count, item);

                this._sql = this._sql.replace("::" + item + "::", "?");

                let value: SQLParam = null;
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
