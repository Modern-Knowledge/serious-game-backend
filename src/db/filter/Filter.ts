import { SQLComparisonOperator } from "../sql/enums/SQLComparisonOperator";
import { SQLOperator } from "../sql/enums/SQLOperator";
import { SQLBlock } from "../sql/SQLBlock";
import { FilterAttribute } from "./FilterAttribute";
import { IFilterable } from "./IFilterable";

/**
 * Class for filtering results from an sql query.
 */
export class Filter implements IFilterable {
    private _root: SQLBlock = new SQLBlock();
    private readonly _tableAlias: string;
    private _empty = true;

    public constructor(tableAlias?: string) {
        this._tableAlias = tableAlias;
    }

    /**
     * Adds a filter-condition.
     *
     * @param name name of the filter condition
     * @param value value of the filter condition
     * @param sqlOperator sql-operator (equals, greater than, ...) between the filter-conditions
     * @param operator optional sql-operator that is appended behind the condition
     */
    public addFilterCondition(
        name: string,
        value: any,
        sqlOperator: SQLComparisonOperator = SQLComparisonOperator.EQUAL,
        operator?: SQLOperator): Filter {

        this._empty = false;
        const filterAttribute: FilterAttribute = new FilterAttribute(name, value, sqlOperator);
        filterAttribute.tableAlias = this._tableAlias;
        this._root.addElement(filterAttribute.getBlock());

        if (operator) {
            this.addOperator(operator);
        }

        return this;
    }

    /**
     * Adds a sub-filter to the filter. Sub-filter is encapsulated in brackets in the filter.
     *
     * @param filter filter that should be added to the current filter
     */
    public addSubFilter(filter: Filter): Filter {
        this._empty = false;
        this._root.addElement(filter.getBlock());
        return this;
    }

    /**
     * Adds an operator to the filter (and, ...).
     *
     * @param operator SQLOperator like AND, OR
     */
    public addOperator(operator: SQLOperator): Filter {
        this._empty = false;
        this._root.addKeyword(operator);
        return this;
    }

    /**
     * Returns the sql-block for the filter.
     */
    public getBlock(): SQLBlock {
        return this._root;
    }

    /**
     * Returns true if the filter is empty.
     */
    get isEmpty() {
        return this._empty;
    }

    /**
     * Clear the filter.
     */
    public clear() {
        this._root = new SQLBlock();
        this._empty = true;
    }
}
