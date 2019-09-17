import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { Helptext } from "../../../lib/models/Helptext";

/**
 * handles CRUD operations with helptexts
 */
export class HelptextFacade extends EntityFacade<Helptext> {

  /**
   * @param tableAlias
   */
  public constructor(tableAlias?: string) {

    if (tableAlias) {
      super("helptexts", tableAlias);
    } else {
      super("helptexts", "hp");
    }
  }

  /**
   * returns SQL-attributes for the helptexts
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] = ["name", "text"];

    return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
  }

  /**
   * returns helptexts that match the specified filter
   * @param excludedSQLAttributes
   */
  public getHelptexts(excludedSQLAttributes?: string[]): Promise<Helptext[]> {
    const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
    return this.select(attributes, this.getJoins());
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  protected fillEntity(result: any): Helptext {
    const helptext: Helptext = new Helptext();

    this.fillDefaultAttributes(result, helptext);

    if (result[this.name("name")] !== undefined) {
      helptext.name = result[this.name("name")];
    }


    if (result[this.name("text")] !== undefined) {
      helptext.text = result[this.name("text")];
    }


    return helptext;
  }

}
