import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { Word } from "../../../lib/models/Word";

/**
 * handles CRUD operations with the word-entity
 */
export class WordFacade extends EntityFacade<Word> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("words", tableAlias);
        } else {
            super("words", "w");
        }
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] =  ["name"];

        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    protected fillEntity(result: any): Word {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const word: Word = new Word();

        this.fillDefaultAttributes(result, word);

        if (result[this.name("name")]) {
            word.name = result[this.name("name")];
        }

        return word;
    }

}
