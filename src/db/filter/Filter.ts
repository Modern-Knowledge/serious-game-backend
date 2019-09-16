import { Filterable } from "./Filterable";
import { FilterAttribute } from "./FilterAttribute";
import { SQLBlock } from "../sql/SQLBlock";
import { SQLOperator } from "../sql/SQLOperator";

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
   * adds a filterAttribute to the filter
   * @param filterAttribute filterAttribute that contains name, value, comparison operator
   */
  public addFilterAttribute(filterAttribute: FilterAttribute): Filter {
    this._empty = false;
    filterAttribute.tableAlias = this._tableAlias;
    this._root.addElement(filterAttribute.getBlock());
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
}
