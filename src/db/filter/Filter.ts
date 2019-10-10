import { Filterable } from "./Filterable";
import { FilterAttribute } from "./FilterAttribute";
import { SQLBlock } from "../sql/SQLBlock";
import { SQLOperator } from "../sql/enums/SQLOperator";
import { SQLComparisonOperator } from "../sql/enums/SQLComparisonOperator";

/**
 * filter for sql statements
 */
export class Filter implements Filterable {
  private _root: SQLBlock = new SQLBlock();
  private _tableAlias: string;
  private _empty: boolean = true;

  public constructor(tableAlias?: string) {
    this._tableAlias = tableAlias;
  }

  /**
   * adds a filter condition to the sql-statement
   * @param name name of the filter condition
   * @param value value of the filter condition
   * @param sqlOperator sql-operator (equals, greater than, ...) between the filter-conditions
   * @param operator optional sql-operator that is appended behind the condition
   */
  public addFilterCondition(name: string, value: any, sqlOperator: SQLComparisonOperator = SQLComparisonOperator.EQUAL, operator?: SQLOperator): Filter {
    this._empty = false;
    const filterAttribute: FilterAttribute = new FilterAttribute(name, value, sqlOperator);
    filterAttribute.tableAlias = this._tableAlias;
    this._root.addElement(filterAttribute.getBlock());

    if (operator) {
      this.addOperator(operator);
    }

    return this;
  }

  /**
   * adds a subFilter to the filter
   * subFilter is encapsulated in brackets
   * @param filter
   */
  public addSubFilter(filter: Filter): Filter {
    this._empty = false;
    this._root.addElement(filter.getBlock());
    return this;
  }

  /**
   * adds an operator to the filter
   * @param operator SQLOperator like AND, OR
   */
  public addOperator(operator: SQLOperator): Filter {
    this._empty = false;
    this._root.addKeyword(operator);
    return this;
  }

  /**
   * returns the sql block for the filter
   */
  public getBlock(): SQLBlock {
    return this._root;
  }

  set tableAlias(value: string) {
    this._tableAlias = value;
  }

  get isEmpty() {
    return this._empty;
  }

  /**
   * clear the filter
   */
  public clear() {
    this._root = new SQLBlock();
    this._empty = true;
  }
}
