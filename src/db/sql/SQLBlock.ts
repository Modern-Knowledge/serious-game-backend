import { SQLElementType } from "./enums/SQLElementType";
import { SQLElement } from "./SQLElement";
import { SQLKeyword } from "./SQLKeyword";
import { SQLParam } from "./SQLParam";
import { SQLText } from "./SQLText";

/**
 * Sql-block that can contain from, select, ... parts of a query.
 */
export class SQLBlock extends SQLElement {

    private _elements: SQLElement[] = [];

    /**
     * Returns the parameters of the sql-block.
     */
    public getParameters(): SQLParam[] {
        let returnParams: SQLParam[] = [];

        returnParams = returnParams.concat(this._parameters);

        for (const currElem of this._elements) {
            returnParams = returnParams.concat(currElem.getParameters());
        }

        return returnParams;
    }

    /**
     * Adds a keyword to the sql-block.
     *
     * @param keyword keyword that should be added
     */
    public addKeyword(keyword: string): void {
        const newKeyword = new SQLKeyword(keyword);
        this._elements.push(newKeyword);
    }

    /**
     * Adds text to the sql-block.
     *
     * @param text text that should be added
     */
    public addText(text: string): void {
        const newText = new SQLText(text);
        this._elements.push(newText);
    }

    /**
     * Adds an element to the sql-block.
     *
     * @param element element that should be added
     */
    public addElement(element: SQLElement): void {
        this._elements.push(element);
    }

    /**
     * Returns the sql for the sql-block.
     */
    public getSQL(): string {
        this.invalidate();

        let sql = "(";

        for (const item of this._elements) {
            sql += item.getSQL();
        }

        sql += ")";

        return sql;
    }

    /**
     * Returns the element-type of a sql-block.
     */
    public getElementType(): number {
        return SQLElementType.SQLBlock;
    }

    /**
     * Validates the elements.
     */
    private invalidate(): void {
        for (let i = 0; i < this._elements.length; i++) {

            const currElement = this._elements[i];

            if (currElement.getElementType() === SQLElementType.SQLKeyword) {
                // tslint:disable-next-line:no-collapsible-if
                if (i === 0 || i >= this._elements.length - 1) {
                    this._elements.splice(i, 1);
                    i -= 2;
                    continue;
                }
            }

            if (currElement.getElementType() === SQLElementType.SQLBlock) {
                const currBlock: SQLBlock = currElement as SQLBlock;
                currBlock.invalidate();
            }
        }
    }
}
