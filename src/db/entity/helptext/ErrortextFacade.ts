import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLJoin } from "../../sql/SQLJoin";
import { JoinType } from "../../sql/JoinType";
import { SQLBlock } from "../../sql/SQLBlock";
import { Filter } from "../../filter/Filter";
import {Errortext} from "../../../lib/models/Errortext";
import {TextFacade} from "./TextFacade";

/**
 * handles CRUD operations with the errortext-entity
 */
export class ErrortextFacade extends EntityFacade<Errortext> {

    private _textFacade: TextFacade;

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("errortexts", tableAlias);
        } else {
            super("errortexts", "errt");
        }

        this._textFacade = new TextFacade("texterr");
    }

    /**
     * returns SQL-attributes for the errortexts
     * @param excludedSQLAttributes sql attributes that are excluded from the query
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["error_id", "severity_id"];

        const textAttributes: SQLAttributes = this._textFacade.getSQLAttributes(excludedSQLAttributes);
        const errortextAttributes: SQLAttributes = new SQLAttributes(this.tableAlias, sqlAttributes);
        errortextAttributes.addSqlAttributes(textAttributes);

        return errortextAttributes;
    }

    /**
     * returns errortexts that match the specified filter
     * @param excludedSQLAttributes
     */
    public getErrorTexts(excludedSQLAttributes?: string[]): Promise<Errortext[]> {
        const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
        return this.select(attributes, this.getJoins());
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Errortext {
        const errortext: Errortext = new Errortext();
        this._textFacade.fillTextEntity(result, errortext);

        return errortext;
    }

    /**
     * creates the joins for the therapist-entity and returns them as a list
     */
    public getJoins(): SQLJoin[] {
        const joins: SQLJoin[] = [];

        const userJoin: SQLBlock = new SQLBlock();
        userJoin.addText(`${this.tableAlias}.error_id = ${this._textFacade.tableAlias}.id`);
        joins.push(new SQLJoin(this._textFacade.tableName, this._textFacade.tableAlias, userJoin, JoinType.JOIN));

        return joins;
    }

    /**
     * returns the userFacadeFilter
     */
    public getTextFacadeFilter(): Filter {
        return this._textFacade.getFacadeFilter();
    }

}
