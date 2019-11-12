import { SQLAttribute } from "./SQLAttribute";
import { SQLParam } from "./SQLParam";

/**
 * represents a sql attribute that can hold a value
 */
export class SQLValueAttribute extends SQLAttribute {
    private readonly _value: any;

    /**
     * @param name name of the sql-value.attribute
     * @param tableAlias table-alias of the sql-value-attribute
     * @param value value of the sql-value-attribute
     */
    public constructor(name: string, tableAlias: string, value: any) {
        super(name, tableAlias);
        this._value = value;
    }

    /**
     * returns the placeholder for the value used in the query
     */
    public getParamName(): string {
        return "__attr_" + this.name + "";
    }

    /**
     * returns name-value pair of the sql value attribute
     */
    public getSQLParam(): SQLParam {
        return new SQLParam(this.getParamName(), this._value, false);
    }

    get value(): any {
        return this._value;
    }
}
