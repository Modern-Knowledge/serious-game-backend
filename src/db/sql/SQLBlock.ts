import { SQLElement } from "./SQLElement";
import { SQLElementType } from "./SQLElementType";
import { SQLParam } from "./SQLParam";
import { SQLKeyword } from "./SQLKeyword";
import { SQLText } from "./SQLText";

export class SQLBlock extends SQLElement {

  private _elements: SQLElement[] = [];

  public getParameters(): SQLParam[] {
    let returnParams: SQLParam[] = [];

    returnParams = returnParams.concat(this._parameters);

    for (const currElem of this._elements) {
      returnParams = returnParams.concat(currElem.getParameters());
    }

    return returnParams;
  }

  public addKeyword(keyword: string): void {
    const newKeyword = new SQLKeyword(keyword);
    this._elements.push(newKeyword);
  }

  public addText(text: string): void {
    const newText = new SQLText(text);
    this._elements.push(newText);
  }

  public addElement(element: SQLElement): void {
    this._elements.push(element);
  }

  public invalidate(): void {
    for (let i = 0; i < this._elements.length; i++) {
      if (i < 0) {
        continue;
      }

      const currElement: SQLElement = this._elements[i];

      if (currElement.getElementType() === SQLElementType.SQLKeyword) {
        if (i == 0 || i >= this._elements.length - 1) {
          this._elements.splice(i, 1);
          i -= 2;
          continue;
        }
        const prev = this._elements[i - 1];
        const next = this._elements[i + 1];

        if (!((prev.getElementType() == SQLElementType.SQLText && next.getElementType() == SQLElementType.SQLText)
          || (prev.getElementType() == SQLElementType.SQLBlock && next.getElementType() == SQLElementType.SQLBlock))) {
          this._elements.splice(i, 1);
          i -= 2;
          continue;
        }
      }

      if (currElement.getElementType() === SQLElementType.SQLBlock) {
        const currBlock: SQLBlock = <SQLBlock> currElement;
        currBlock.invalidate();
        if (currBlock._elements.length === 0) {
          delete this._elements[i];
          i -= 2;
          continue;
        }
      }
    }
  }

  public getSQL(): string {
    this.invalidate();

    if (this._elements.length === 0) {
      return "";
    }

    let sql: string = "(";

    for (const item of this._elements) {
      sql += item.getSQL();
    }

    sql += ")";

    return sql;
  }

  public getElementType(): number {
    return SQLElementType.SQLBlock;
  }
}
