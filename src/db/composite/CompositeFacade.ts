import { AbstractModel } from "../../lib/models/AbstractModel";
import { EntityFacade } from "../entity/EntityFacade";
import { Filter } from "../filter/Filter";
import { SQLOperator } from "../sql/enums/SQLOperator";

/**
 * base facade for composite facades
 */
export abstract class CompositeFacade<EntityType extends AbstractModel> extends EntityFacade<EntityType> {

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
     * returns the composite entity by id
     * @param id
     * @param excludedSQLAttributes
     */
    public async getById(id: number, excludedSQLAttributes?: string[]): Promise<EntityType> {
        if (this._autoCombineFilter) {
            this.combineFilters();
        }
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
        return super.get(excludedSQLAttributes);
    }

    /**
     * returns the composite filters of the array as an array
     */
    protected get filters(): Filter[] {
        return [];
    }

    /**
     * clears every filter in the composite facade
     */
    public clearFilters(): void {
        for (const filter of this.filters) {
            filter.clear();
        }
    }

    /**
     * combines the composite facade filters with the specified sql-operator
     */
    private combineFilters(): void {
        this.clearFilter()
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

    set sqlOperator(value: SQLOperator) {
        this._sqlOperator = value;
    }

    set autoCombineFilter(value: boolean) {
        this._autoCombineFilter = value;
    }
}
