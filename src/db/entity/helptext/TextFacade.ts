
import { Text } from "serious-game-library/dist/models/Text";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * Handles CRUD operations with the text-entity.
 */
export class TextFacade extends EntityFacade<Text> {

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("texts", tableAlias);
        } else {
            super("texts", "t");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["name", "text"];
        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * Assigns common values to the created text and returns the text.
     *
     * @param result retrieved result
     * @param text entity that should be filled
     */
    public fillTextEntity(result: any, text: Text): Text {
        this.fillDefaultAttributes(result, text);

        if (result[this.name("name")]) {
            text.name = result[this.name("name")];
        }

        if (result[this.name("text")]) {
            text.text = result[this.name("text")];
        }

        return text;
    }

    /**
     * Fills the text-entity from the result.
     *
     * @param result database results
     */
    protected fillEntity(result: any): Text {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const text: Text = new Text();
        this.fillTextEntity(result, text);

        return text;
    }

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param text entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, text: Text): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const nameAttribute: SQLValueAttribute = new SQLValueAttribute("name", prefix, text.name);
        attributes.addAttribute(nameAttribute);

        const textAttribute: SQLValueAttribute = new SQLValueAttribute("text", prefix, text.text);
        attributes.addAttribute(textAttribute);

        return attributes;
    }

}
