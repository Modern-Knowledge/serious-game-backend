import { SQLElementType } from "./enums/SQLElementType";
import { SQLElement } from "./SQLElement";

/**
 * represents a simple sql keyword like AND, OR
 */
export class SQLKeyword extends SQLElement {
  private readonly _keyword: string;

  /**
   * @param keyword
   */
  public constructor(keyword: string) {
    super();
    this._keyword = keyword;
  }

  /**
   * returns the element type for the sql keyword
   */
  public getElementType(): number {
    return SQLElementType.SQLKeyword;
  }

  /**
   * returns the sql
   */
  public getSQL(): string {
    return " " + this._keyword + " ";
  }
}
