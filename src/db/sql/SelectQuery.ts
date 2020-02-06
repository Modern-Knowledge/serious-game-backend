import { NamedParameterizedQuery } from "./NamedParameterizedQuery";
import { SQLFrom } from "./SQLFrom";
import { SQLJoin } from "./SQLJoin";
import { SQLOrderBy } from "./SQLOrderBy";
import { SQLParam } from "./SQLParam";
import { SQLSelect } from "./SQLSelect";
import { SQLWhere } from "./SQLWhere";

/**
 * Class that represents a sql-select-statement.
 *
 * e.g.: select %attributes% FROM %tablename% %tablealias% (%join%)? (WHERE %condition)? (ORDER BY %name% ASC|DESC)
 */
export class SelectQuery extends NamedParameterizedQuery {
    private _sqlSelect: SQLSelect;
    private _sqlFrom: SQLFrom;
    private _sqlJoins: SQLJoin[] = [];
    private _sqlWhere: SQLWhere;
    private _sqlOrderBy: SQLOrderBy[] = [];

    public constructor() {
        super();
    }

    /**
     * Returns the parameters (name-value pairs) for the select query.
     */
    public getParameters(): SQLParam[] {
        let returnParams: SQLParam[] = [];

        if (this._sqlSelect !== undefined) {
            returnParams = returnParams.concat(this._sqlSelect.getParameters());
        }

        if (this._sqlFrom !== undefined) {
            returnParams = returnParams.concat(this._sqlFrom.getParameters());
        }

        for (const item of this._sqlJoins) {
            returnParams = returnParams.concat(item.getParameters());
        }

        if (this._sqlWhere !== undefined) {
            returnParams = returnParams.concat(this._sqlWhere.getParameters());
        }

        return returnParams;
    }

    /**
     * Adds a list of joins for the statement to the list.
     *
     * @param joins array of joins that should be added
     */
    public addJoins(joins: SQLJoin[]): void {
        if (joins !== undefined) {
            this._sqlJoins = this._sqlJoins.concat(joins);
        }
    }

    /**
     * Returns the sql-statement for the select query.
     */
    public getSql(): string {
        let returnSQL = "";
        if (this._sqlSelect !== undefined) {
            returnSQL += this._sqlSelect.getSQL();
        }

        if (this._sqlFrom !== undefined) {
            returnSQL += this._sqlFrom.getSQL();
        }

        for (const currJoin of this._sqlJoins) {
            returnSQL += currJoin.getSQL();
        }

        if (this._sqlWhere !== undefined) {
            const where: string = this._sqlWhere.getSQL();
            returnSQL += where;
        }

        if (this._sqlOrderBy.length > 0) {
            returnSQL += " ORDER BY ";
            for (let i = 0; i < this._sqlOrderBy.length; i++) {
                returnSQL += this._sqlOrderBy[i].getSQL();
                returnSQL += (i === this._sqlOrderBy.length - 1) ? "" : ", ";
            }
        }

        return returnSQL;
    }

    set sqlSelect(value: SQLSelect) {
        this._sqlSelect = value;
    }

    set sqlFrom(value: SQLFrom) {
        this._sqlFrom = value;
    }

    set sqlWhere(value: SQLWhere) {
        this._sqlWhere = value;
    }

    set sqlOrderBy(value: SQLOrderBy[]) {
        this._sqlOrderBy = value;
    }
}
