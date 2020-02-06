import { SQLElementType } from "./enums/SQLElementType";
import { SQLElement } from "./SQLElement";
import { SQLParam } from "./SQLParam";

/**
 * Class that represents the where part of a sql-query.
 */
export class SQLWhere extends SQLElement {
    private readonly _condition: SQLElement;

    /**
     * @param condition condition for the sql-where
     */
    public constructor(condition?: SQLElement) {
        super();
        if (condition) {
            this._condition = condition;
        }
    }

    /**
     * Returns the sql-params (name-value pairs) for the where-part.
     */
    public getParameters(): SQLParam[] {
        let returnParams: SQLParam[] = [];

        returnParams = returnParams.concat(this._parameters);
        returnParams = returnParams.concat(this._condition.getParameters());

        return returnParams;
    }

    /**
     * Returns the element type.
     */
    public getElementType(): number {
        return SQLElementType.SQLWhere;
    }

    /**
     * Returns the string for the where part of a sql-query.
     */
    public getSQL(): string {
        return "WHERE " + this._condition.getSQL();
    }

}
