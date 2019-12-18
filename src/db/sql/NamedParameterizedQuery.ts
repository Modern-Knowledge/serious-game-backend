import { BakedQuery } from "./BakedQuery";
import { SQLParam } from "./SQLParam";

/**
 * Class that represents sql-queries with named parameters.
 */
export abstract class NamedParameterizedQuery {

    protected constructor() {}

    /**
     * Returns parameters with concrete values for the query.
     */
    public abstract getParameters(): SQLParam[];

    /**
     * Returns a new baked query.
     */
    public bake(): BakedQuery {
        return new BakedQuery(this);
    }

    /**
     * Generates and returns the sql-statement.
     */
    public abstract getSql(): string;
}
