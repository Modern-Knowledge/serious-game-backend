import { Word } from "serious-game-library/dist/models/Word";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * Handles CRUD operations with the word-entity.
 */
export class WordFacade extends EntityFacade<Word> {

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("words", tableAlias);
        } else {
            super("words", "w");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] =  ["name"];

        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * Inserts a new word and returns the created word.
     *
     * @param word word that should be inserted
     */
    public async insert(word: Word): Promise<Word> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(word);
        const result = await this.insertStatement(attributes);

        if (result.length > 0) {
            word.id = result[0].insertedId;
        }

        return word;
    }

    /**
     * Fills the word-entity from the result.
     *
     * @param result database results
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
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param word entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, word: Word): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const nameAttribute: SQLValueAttribute = new SQLValueAttribute("name", prefix, word.name);
        attributes.addAttribute(nameAttribute);

        return attributes;
    }

}
