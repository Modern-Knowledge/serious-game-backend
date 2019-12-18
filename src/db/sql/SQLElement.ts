import { SQLParam } from "./SQLParam";

/**
 * Base class for all sql-elements (where, from, ...).
 * Every sql element has a list of parameters.
 */
export abstract class SQLElement {
    protected _parameters: SQLParam[] = [];

    /**
     * Adds parameters to the list.
     * @param param parameter that should be added
     */
    public addParameter(param: SQLParam): void {
        this._parameters.push(param);
    }

    /**
     * Returns the parameters.
     */
    public getParameters(): SQLParam[] {
        return this._parameters;
    }

    /**
     * Returns the sql element type.
     */
    public abstract getElementType(): number;

    /**
     * Returns the sql of the sql element.
     */
    public abstract getSQL(): string;
}
