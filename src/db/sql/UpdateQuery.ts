import { NamedParameterizedQuery } from "./NamedParameterizedQuery";
import { SQLParam } from "./SQLParam";
import { SQLUpdate } from "./SQLUpdate";
import { SQLWhere } from "./SQLWhere";

/**
 * Class that represents a sql-update-query.
 *
 * syntax: UPDATE %tablename% SET (%attr% = %value%, ...) (WHERE condition)?
 */
export class UpdateQuery extends NamedParameterizedQuery {

    private _update: SQLUpdate;
    private _where: SQLWhere;

    public constructor() {
        super();
    }

    /**
     * Returns the sql-parameters (name-value pairs) for the update query.
     */
    public getParameters(): SQLParam[] {
        let returnParams: SQLParam[] = [];

        if (this._update !== undefined) {
            returnParams = returnParams.concat(this._update.getParameters());
        }

        if (this._where !== undefined) {
            returnParams = returnParams.concat(this._where.getParameters());
        }

        return returnParams;
    }

    /**
     * Returns the sql for the update-query.
     */
    public getSql(): string {
        let returnStr = "";

        if (this._update !== undefined) {
            returnStr += this._update.getSQL() + " ";
        }

        if (this._where !== undefined) {
            returnStr += this._where.getSQL();
        }

        return returnStr;
    }

    set update(value: SQLUpdate) {
        this._update = value;
    }

    set where(value: SQLWhere) {
        this._where = value;
    }
}
