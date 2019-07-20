import { SQLElement } from "./SQLElement";
import { SQLElementType } from "./SQLElementType";

export class SQLKeyword extends SQLElement {
  private readonly _keyword: string;

  constructor(keyword: string) {
    super();
    this._keyword = keyword;
  }

  public getElementType(): number {
    return SQLElementType.SQLKeyword;
  }

  public getSQL(): string {
    return " " + this._keyword + " ";
  }
}
