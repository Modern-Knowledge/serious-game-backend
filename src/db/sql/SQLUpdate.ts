import { SQLElementType } from "./enums/SQLElementType";
import { SQLElement } from "./SQLElement";
import { SQLParam } from "./SQLParam";
import { SQLValueAttributes } from "./SQLValueAttributes";

/**
 * Class that represents the update part of a sql-query.
 */
export class SQLUpdate extends SQLElement {

    private readonly _tableName: string;
    private readonly _tableAlias: string;
    private _attributes: SQLValueAttributes;

    /**
     * @param tableName table-name of the sql-update
     * @param tableAlias table-alias of the sql-update
     */
    public constructor(tableName: string, tableAlias: string) {
        super();
        this._tableName = tableName;
        this._tableAlias = tableAlias;
    }

    /**
     * Returns the parameters (name-value pairs) for the update.
     */
    public getParameters(): SQLParam[] {
        let returnParams: SQLParam[] = [];

        if (this._attributes !== undefined) {
            returnParams = returnParams.concat(this._attributes.getSqlParams());
        }

        return returnParams;
    }

    /**
     * Returns the element type.
     */
    public getElementType(): number {
        return SQLElementType.SQLUpdate;
    }

    /**
     * Returns the sql for the update part of the query.
     */
    public getSQL(): string {
        let returnStr: string = "UPDATE " + this._tableName + " " + this._tableAlias + " SET ";
        returnStr += this._attributes.getNameParamNamePairs();

        return returnStr;
    }

    set attributes(value: SQLValueAttributes) {
        this._attributes = value;
    }

}
