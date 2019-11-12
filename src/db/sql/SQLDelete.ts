import { SQLElementType } from "./enums/SQLElementType";
import { SQLElement } from "./SQLElement";

/**
 * represents the delete part of a sql query
 */
export class SQLDelete extends SQLElement {

    private readonly _tableName: string;
    private _tableAlias: string;

    /**
     * @param tableName table-name of the delete-query
     * @param tableAlias table-alias of the delete-query
     */
    public constructor(tableName: string, tableAlias: string) {
        super();
        this._tableName = tableName;
        this._tableAlias = tableAlias;
    }

    public getElementType(): number {
        return SQLElementType.SQLDelete;
    }

    /**
     * Returns the sql for the delete query.
     */
    public getSQL(): string {
        return "DELETE FROM " + this._tableName;
    }

}
