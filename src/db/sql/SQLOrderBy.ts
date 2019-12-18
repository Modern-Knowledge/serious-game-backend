import { SQLElementType } from "./enums/SQLElementType";
import { SQLOrder } from "./enums/SQLOrder";
import { SQLElement } from "./SQLElement";

/**
 * Class that represents the order-by part of the sql-query.
 */
export class SQLOrderBy extends SQLElement {
    private readonly _attribute: string;
    private readonly _order: SQLOrder;
    private readonly _tableAlias: string;

    /**
     * @param attribute attribute of sql-order by
     * @param order order of the order-by (ASC, DESC)
     * @param tableAlias table-alias of the order-by
     */
    public constructor(attribute: string, order: SQLOrder, tableAlias: string) {
        super();
        this._attribute = attribute;
        this._order = order;
        this._tableAlias = tableAlias;
    }

    /**
     * Returns the element type.
     */
    public getElementType(): number {
        return SQLElementType.SQLOrderBy;
    }

    /**
     * Returns the sql string for the order by part.
     */
    public getSQL(): string {
        return this._tableAlias + "." + this._attribute + " " + this._order;
    }
}
