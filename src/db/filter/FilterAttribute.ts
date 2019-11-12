import { SQLComparisonOperator } from "../sql/enums/SQLComparisonOperator";
import { SQLBlock } from "../sql/SQLBlock";
import { SQLParam } from "../sql/SQLParam";
import { IFilterable } from "./IFilterable";

/**
 * filterAttribute in the where part of a query
 * e.g.: %tableAlias%.%name% (=|!=|<|>, ...) %value%
 */
export class FilterAttribute implements IFilterable {
    private readonly _name: string;
    private readonly _value: any;
    private readonly _comparisonOperator: SQLComparisonOperator;
    private _tableAlias: string;

    /**
     * @param name name of the attribute e.g.: username
     * @param value value of the attribute
     * @param comparisonOperator comparison operator e.g.: =, <
     */
    public constructor(name: string, value: any, comparisonOperator: SQLComparisonOperator) {
        this._name = name;
        this._value = value;
        this._comparisonOperator = comparisonOperator;
    }

    /**
     * Returns the sql block for the filterAttribute.
     */
    public getBlock(): SQLBlock {
        const block: SQLBlock = new SQLBlock();
        block.addText(`${this._tableAlias + "."}${this._name} ${this._comparisonOperator} ` +
            `::${this._tableAlias + "_" + this._name}::`);
        block.addParameter(new SQLParam(`${this._tableAlias + "_" + this._name}`, this._value, false));

        return block;
    }

    set tableAlias(value: string) {
        this._tableAlias = value;
    }
}
