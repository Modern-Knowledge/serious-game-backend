import { SQLElementType } from "./enums/SQLElementType";
import { SQLElement } from "./SQLElement";

/**
 * Class that represents a simple text in sql.
 */
export class SQLText extends SQLElement {
    private readonly _text: string;

    /**
     * @param text text for the sql-text
     */
    public constructor(text: string) {
        super();
        this._text = text;
    }

    /**
     * Returns the element-type for sql-text.
     */
    public getElementType(): number {
        return SQLElementType.SQLText;
    }

    /**
     * Returns the sql-text.
     */
    public getSQL(): string {
        return " " + this._text + " ";
    }
}
