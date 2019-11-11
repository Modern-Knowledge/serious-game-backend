import { SQLElementType } from "./enums/SQLElementType";
import { SQLElement } from "./SQLElement";

/**
 * represents a simple text in sql
 */
export class SQLText extends SQLElement {
  private readonly _text: string;

  /**
   * @param text
   */
  public constructor(text: string) {
    super();
    this._text = text;
  }

  /**
   * returns the element type for sql text
   */
  public getElementType(): number {
    return SQLElementType.SQLText;
  }

  /**
   * returns the sql type
   */
  public getSQL(): string {
    return " " + this._text + " ";
  }
}
