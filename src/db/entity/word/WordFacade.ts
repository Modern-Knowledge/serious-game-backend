import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { Word } from "../../../lib/models/Word";
import { Game } from "../../../lib/models/Game";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";

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
     * inserts a new word and returns the created word
     * @param word
     */
    public async insertWord(word: Word): Promise<Word> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(word);
        const result = await this.insert(attributes);

        if (result.length > 0) {
            word.id = result[0].insertedId;
        }

        return word;
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

    /**
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
     * @param word entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, word: Word): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const nameAttribute: SQLValueAttribute = new SQLValueAttribute("name", prefix, word.name);
        attributes.addAttribute(nameAttribute);

        return attributes;
    }

}
