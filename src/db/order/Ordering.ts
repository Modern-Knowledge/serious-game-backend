/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { SQLOrderBy } from "../sql/SQLOrderBy";
import { SQLOrder } from "../sql/enums/SQLOrder";

export class Ordering {
    protected _tableAlias: string;

    private _orderBys: SQLOrderBy[] = [];

    public constructor(tableAlias: string) {
        this._tableAlias = tableAlias;
    }

    /**
     * add an order by clause
     * @param attribute attribute for ordering
     * @param order attribute sort order (ASC|DESC)
     */
    public addOrderBy(attribute: string, order: SQLOrder = SQLOrder.DESC): void {
        this._orderBys.push(new SQLOrderBy(attribute, order, this._tableAlias));
    }

    /**
     * clear order-bys
     */
    public clear() {
        this._orderBys = [];
    }

    /**
     * returns order bys
     */
    get orderBys(): SQLOrderBy[] {
        return this._orderBys;
    }

    /**
     * add an ordering (order-by) to this ordering
     * @param ordering
     */
    public addOrdering(ordering: Ordering) {
        this._orderBys = this._orderBys.concat(ordering._orderBys);
    }
}