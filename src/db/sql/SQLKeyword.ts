import { SQLElementType } from "./enums/SQLElementType";
import { SQLElement } from "./SQLElement";

/**
 * Class that represents a simple sql-keyword like AND, OR.
 */
export class SQLKeyword extends SQLElement {
    private readonly _keyword: string;

    /**
     * @param keyword keyword to represent
     */
    public constructor(keyword: string) {
        super();
        this._keyword = keyword;
    }

    /**
     * Returns the element type for the sql-keyword.
     */
    public getElementType(): number {
        return SQLElementType.SQLKeyword;
    }

    /**
     * Returns the sql-keyword.
     */
    public getSQL(): string {
        return " " + this._keyword + " ";
    }
}
