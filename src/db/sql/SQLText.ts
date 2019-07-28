import { SQLElement } from "./SQLElement";
import { SQLElementType } from "./SQLElementType";

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
  getElementType(): number {
    return SQLElementType.SQLText;
  }

  /**
   * returns the sql type
   */
  getSQL(): string {
    return " " + this._text + " ";
  }
}
