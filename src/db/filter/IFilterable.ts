import { SQLBlock } from "../sql/SQLBlock";

/**
 * defines classes that can be used in the where filter
 */
export interface IFilterable {
    /**
     * returns the sql block
     */
    getBlock(): SQLBlock;
}
