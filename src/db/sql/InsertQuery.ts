import { NamedParameterizedQuery } from "./NamedParameterizedQuery";
import { SQLInsert } from "./SQLInsert";
import { SQLParam } from "./SQLParam";

/**
 * Class that represents a sql-insert-statement.
 *
 * e.g.: INSERT INTO %tablename% (%attributes%) VALUES (%values%)
 */
export class InsertQuery extends NamedParameterizedQuery {
    private _insert: SQLInsert;

    /**
     * @param insert insert-query
     */
    public constructor(insert?: SQLInsert) {
        super();

        this._insert = insert;
    }

    /**
     * Returns the sql-parameters (name-value pairs) for the insert query.
     */
    public getParameters(): SQLParam[] {
        let returnParams: SQLParam[] = [];

        if (this._insert !== undefined) {
            returnParams = returnParams.concat(this._insert.getParameters());
        }

        return returnParams;
    }

    /**
     * Returns the sql-statement for the insert query.
     */
    public getSql(): string {
        let returnSql = "";

        if (this._insert !== undefined) {
            returnSql += this._insert.getSQL();
        }

        return returnSql;
    }

    set insert(value: SQLInsert) {
        this._insert = value;
    }
}
