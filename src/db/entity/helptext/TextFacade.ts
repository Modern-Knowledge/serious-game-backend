import { EntityFacade } from "../EntityFacade";
import { Text } from "../../../lib/models/Text";
import { SQLAttributes } from "../../sql/SQLAttributes";

/**
 * handles CRUD operations with the text-entity
 */
export class TextFacade extends EntityFacade<Text> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("texts", tableAlias);
        } else {
            super("texts", "t");
        }
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["name", "text"];
        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * fills the entity
     * @param result result for filling
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
     * assigns the retrieved common values to the newly created text and returns the text
     * @param result retrieved result
     * @param text entity to fill
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

}