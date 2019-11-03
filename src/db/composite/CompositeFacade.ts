import { AbstractModel } from "../../lib/models/AbstractModel";
import { EntityFacade } from "../entity/EntityFacade";
import { Filter } from "../filter/Filter";
import { SQLOperator } from "../sql/enums/SQLOperator";
import { SQLOrderBy } from "../sql/SQLOrderBy";
import { Ordering } from "../order/Ordering";

/**
 * base class for composite facades
 * contains methods for filtering composite facades
 */
export abstract class CompositeFacade<EntityType extends AbstractModel<EntityType>> extends EntityFacade<EntityType> {

    private _sqlOperator: SQLOperator = SQLOperator.AND;
    private _autoCombineFilter: boolean = true;

    /**
     * @param tableName
     * @param tableAlias
     */
    protected constructor(tableName: string, tableAlias: string) {
        super(tableName, tableAlias);
    }

    /**
     * returns the entity by id
     * @param id
     * @param excludedSQLAttributes
     */
    public async getById(id: number, excludedSQLAttributes?: string[]): Promise<EntityType> {
        this.combineOrderBys();
        return super.getById(id, excludedSQLAttributes);
    }

    /**
     * returns all entities that match the specified filter
     * @param excludedSQLAttributes
     */
    public async get(excludedSQLAttributes?: string[]): Promise<EntityType[]> {
        if (this._autoCombineFilter) {
            this.combineFilters();
        }

        this.combineOrderBys();

        return super.get(excludedSQLAttributes);
    }

    /**
     * returns all entities that match the specified filter
     * @param excludedSQLAttributes
     */
    public async getOne(excludedSQLAttributes?: string[]): Promise<EntityType> {
        if (this._autoCombineFilter) {
            this.combineFilters();
        }

        this.combineOrderBys();

        return super.getOne(excludedSQLAttributes);
    }

    /**
     * returns all sub facade filters of the facade as an array
     */
    protected get filters(): Filter[] {
        return [];
    }

    /**
     * clears filters from the facades in the composite facade
     */
    public clearFacadeFilters(): void {
        for (const filter of this.filters) {
            filter.clear();
        }
    }

    /**
     * combines the composite facade filters to one filter with the specified sql-operator
     */
    private combineFilters(): void {
        const compositeFacadeFilters: Filter[] = this.filters;
        const newFilter: Filter = new Filter(this.tableAlias);
        const facadeFilter: Filter = this.filter;

        compositeFacadeFilters.push(facadeFilter);

        for (const filter of compositeFacadeFilters) {
            if (!filter.isEmpty) {
                newFilter.addSubFilter(filter);
                newFilter.addOperator(this._sqlOperator);
            }
        }

        this.filter = newFilter;
    }

    /**
     * sql-operator to combine composite filters with
     * @param value
     */
    set sqlOperator(value: SQLOperator) {
        this._sqlOperator = value;
    }

    /**
     * enable auto combine composite filters with specified sqlOperator
     * @param value
     */
    set autoCombineFilter(value: boolean) {
        this._autoCombineFilter = value;
    }

    /**
     * returns all sub facade order-bys of the facade as an array
     */
    protected get orderBys(): Ordering[] {
        return [];
    }

    /**
     * combines the composite facade order-bys to one order-by
     */
    private combineOrderBys(): void {
        const compositeFacadeOrdering: Ordering[] = this.orderBys;
        const newOrdering = new Ordering(this.tableAlias);
        const facadeOrdering = this.ordering;

        newOrdering.addOrdering(facadeOrdering);

        for (const ordering of compositeFacadeOrdering) {
            newOrdering.addOrdering(ordering);
        }

        this.ordering = newOrdering;
    }
}
