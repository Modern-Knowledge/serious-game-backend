import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLJoin } from "../../sql/SQLJoin";
import { JoinType } from "../../sql/JoinType";
import { SQLBlock } from "../../sql/SQLBlock";
import { Filter } from "../../filter/Filter";
import {TextFacade} from "./TextFacade";
import {Helptext} from "../../../lib/models/Helptext";

/**
 * handles CRUD operations with the helptext-entity
 * Joins:
 * - texts (1:1)
 */
export class HelptextFacade extends EntityFacade<Helptext> {

  private _textFacade: TextFacade;

  /**
   * @param tableAlias
   */
  public constructor(tableAlias?: string) {
    if (tableAlias) {
      super("helptexts", tableAlias);
    } else {
      super("helptexts", "helpt");
    }

    this._textFacade = new TextFacade("texthelp");
  }

  /**
   * returns SQL-attributes for the helptexts
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] = ["helptext_id"];

    const textAttributes: SQLAttributes = this._textFacade.getSQLAttributes(excludedSQLAttributes);
    const helptextAttributes: SQLAttributes = new SQLAttributes(this.tableAlias, sqlAttributes);
    helptextAttributes.addSqlAttributes(textAttributes);

    return helptextAttributes;
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  public fillEntity(result: any): Helptext {
    const helptext: Helptext = new Helptext();
    this._textFacade.fillTextEntity(result, helptext);

    return helptext;
  }

  /**
   * creates the joins for the therapist-entity and returns them as a list
   */
  public getJoins(): SQLJoin[] {
    const joins: SQLJoin[] = [];

    const userJoin: SQLBlock = new SQLBlock();
    userJoin.addText(`${this.tableAlias}.helptext_id = ${this._textFacade.tableAlias}.id`);
    joins.push(new SQLJoin(this._textFacade.tableName, this._textFacade.tableAlias, userJoin, JoinType.JOIN));

    return joins;
  }

  /**
   * returns the textFacadeFilter
   */
  public getTextFacadeFilter(): Filter {
    return this._textFacade.getFacadeFilter();
  }

}
