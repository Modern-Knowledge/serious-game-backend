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
     * returns SQL-attributes for the user
     * @param excludedSQLAttributes sql attributes that are excluded from the query
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
        const text: Text = new Text();
        this.fillTextEntity(result, text);

        return text;
    }

    /**
     * assigns the retrieved values to the newly created user and returns the user
     * @param result retrieved result
     * @param text entity to fill
     */
    public fillTextEntity(result: any, text: Text): Text {
        this.fillDefaultAttributes(result, text);

        if (result[this.name("name")] !== undefined) {
            text.name = result[this.name("name")];
        }

        if (result[this.name("text")] !== undefined) {
            text.text = result[this.name("text")];
        }

        return text;
    }

}