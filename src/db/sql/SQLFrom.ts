import { SQLElementType } from "./enums/SQLElementType";
import { SQLElement } from "./SQLElement";

/**
 * Represents the from-part of an sql-query.
 */
export class SQLFrom extends SQLElement {

    private readonly _tableName: string;
    private readonly _tableAlias: string;

    /**
     * @param tableName table-name of the sql-from
     * @param tableAlias table-alias of the sql-from
     */
    public constructor(tableName: string, tableAlias: string) {
        super();
        this._tableName = tableName;
        this._tableAlias = tableAlias;
    }

    /**
     * Returns the element type.
     */
    public getElementType(): number {
        return SQLElementType.SQLFrom;
    }

    /**
     * Returns the sql for the from-element.
     */
    public getSQL(): string {
        let returnSQL = "";

        if (this._tableName !== undefined && (this._tableName.length !== 0)) {
            returnSQL += "FROM " + this._tableName + " ";
        }

        if (this._tableAlias !== undefined && (this._tableAlias.length !== 0)) {
            returnSQL += "AS " + this._tableAlias + " ";
        }

        return returnSQL;
    }
}
