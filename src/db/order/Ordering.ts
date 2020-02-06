
import { SQLOrder } from "../sql/enums/SQLOrder";
import { SQLOrderBy } from "../sql/SQLOrderBy";

/**
 * Class for ordering results of a sql-query.
 */
export class Ordering {
    protected _tableAlias: string;
    private _orderBys: SQLOrderBy[] = [];

    /**
     * @param tableAlias tableAlias for the order bys
     */
    public constructor(tableAlias: string) {
        this._tableAlias = tableAlias;
    }

    /**
     * Add an order by clause.
     *
     * @param attribute attribute for ordering
     * @param order attribute sort order (ASC|DESC)
     */
    public addOrderBy(attribute: string, order: SQLOrder = SQLOrder.DESC): void {
        this._orderBys.push(new SQLOrderBy(attribute, order, this._tableAlias));
    }

    /**
     * Returns order bys.
     */
    get orderBys(): SQLOrderBy[] {
        return this._orderBys;
    }

    /**
     * Add an ordering (order-by) to this ordering.
     *
     * @param ordering order-by that should be added
     */
    public addOrdering(ordering: Ordering) {
        this._orderBys = this._orderBys.concat(ordering._orderBys);
    }
}
