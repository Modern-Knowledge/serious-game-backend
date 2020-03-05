import { SQLComparisonOperator } from "../sql/enums/SQLComparisonOperator";
import { SQLBlock } from "../sql/SQLBlock";
import { SQLParam } from "../sql/SQLParam";
import { IFilterable } from "./IFilterable";

/**
 * Filter-attribute in the where part of a query.
 *
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
     * Returns the sql- block for the filter-attribute.
     */
    public getBlock(): SQLBlock {
        const paramName = this._tableAlias + "_" + this._name;
        let val = `::${paramName}::`;
        if (this._comparisonOperator === SQLComparisonOperator.IN) {
            val = "(" + val + ")";
        }

        const block: SQLBlock = new SQLBlock();
        block.addText(`${this._tableAlias + "."}${this._name} ${this._comparisonOperator} ` + val);
        block.addParameter(new SQLParam(paramName, this._value, false));

        return block;
    }

    set tableAlias(value: string) {
        this._tableAlias = value;
    }
}
