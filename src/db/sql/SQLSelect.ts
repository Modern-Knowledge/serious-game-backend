import { SQLElement } from "./SQLElement";
import { SQLAttributes } from "./SQLAttributes";
import { SQLElementType } from "./SQLElementType";

export class SQLSelect extends SQLElement {
  private readonly _attributes: SQLAttributes;

  public constructor(attributes: SQLAttributes) {
    super();
    this._attributes = attributes;
  }

  public getElementType(): number {
    return SQLElementType.SQLSelect;
  }

  public getSQL(): string {
    if (this._attributes === undefined) {
      return "";
    }
    return "SELECT " + this._attributes.getCommaSeparatedNames() + " ";
  }
}
