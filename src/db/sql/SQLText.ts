import { SQLElement } from "./SQLElement";
import { SQLElementType } from "./SQLElementType";

export class SQLText extends SQLElement {
  private readonly _text: string;

  constructor(text: string) {
    super();
    this._text = text;
  }

  getElementType(): number {
    return SQLElementType.SQLText;
  }

  getSQL(): string {
    return " " + this._text + " ";
  }
}
