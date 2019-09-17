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
   * returns SQL-attributes for the words
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] =  ["name"];

    return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
  }

  /**
   * returns words that match the specified filter
   * @param excludedSQLAttributes
   */
  public getWords(excludedSQLAttributes?: string[]): Promise<Word[]> {
    const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
    return this.select(attributes, this.getJoins());
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  protected fillEntity(result: any): Word {
    const word: Word = new Word();

    this.fillDefaultAttributes(result, word);

    if (result[this.name("name")] !== undefined) {
      word.name = result[this.name("name")];
    }

    return word;
  }

}
