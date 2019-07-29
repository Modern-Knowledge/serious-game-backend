import { Filterable } from "./Filterable";
import { SQLBlock } from "../sql/SQLBlock";
import { SQLComparisonOperator } from "../sql/SQLComparisonOperator";
import { SQLParam } from "../sql/SQLParam";

/**
 * filterAttribute in the where part of a query
 * e.g.: %tableAlias%.%name% (=|!=|<|>, ...) %value%
 */
export class FilterAttribute implements Filterable {
  private readonly _name: string;
  private readonly _value: string;
  private readonly _comparisonOperator: SQLComparisonOperator;
  private _tableAlias: string;

  /**
   * @param name name of the attribute e.g.: username
   * @param value value of the attribute
   * @param comparisonOperator comparison operator e.g.: =, <
   */
  public constructor(name: string, value: string, comparisonOperator: SQLComparisonOperator) {
    this._name = name;
    this._value = value;
    this._comparisonOperator = comparisonOperator;
  }

  /**
   * returns the sql block for the filterAttribute
   */
  public getBlock(): SQLBlock {
    const block: SQLBlock = new SQLBlock();
    block.addText(`${(this._tableAlias !== undefined ? this._tableAlias + "." : "")}${this._name} ${this._comparisonOperator} ::${this._name}::`);
    block.addParameter(new SQLParam(`${this._name}`, this._value, false));

    return block;
  }

  set tableAlias(value: string) {
    this._tableAlias = value;
  }
}
