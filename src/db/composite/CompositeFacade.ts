import {AbstractModel} from "../../lib/models/AbstractModel";
import {EntityFacade} from "../entity/EntityFacade";
import {Filter} from "../filter/Filter";
import {SQLOperator} from "../sql/enums/SQLOperator";

/**
 * base facade for composite facades
 */
export abstract class CompositeFacade<EntityType extends AbstractModel> extends EntityFacade<EntityType> {

    /**
     * @param tableName
     * @param tableAlias
     */
    protected constructor(tableName: string, tableAlias: string) {
        super(tableName, tableAlias);
    }

    /**
     * returns the composite filters as an array
     */
    protected get filters(): Filter[] {
        return [];
    }

    /**
     * combines the composite facade filters with the specified sql-operator
     * @param operator sql-operator between the filters
     */
    public combineFilters(operator: SQLOperator = SQLOperator.AND): void {
        const compositeFacadeFilters: Filter[] = this.filters;
        const facadeFilter = this.filter;

        for (const filter of compositeFacadeFilters) {
            facadeFilter.addSubFilter(filter);
            facadeFilter.addOperator(operator);
        }

        this.filter = facadeFilter;
    }
}
