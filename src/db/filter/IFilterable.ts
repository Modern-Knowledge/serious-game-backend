import { SQLBlock } from "../sql/SQLBlock";

/**
 * Defines classes that can be used as a filter-attribute.
 */
export interface IFilterable {

    /**
     * Returns the sql-block.
     */
    getBlock(): SQLBlock;
}
