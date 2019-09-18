import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLJoin } from "../../sql/SQLJoin";
import { JoinType } from "../../sql/JoinType";
import { SQLBlock } from "../../sql/SQLBlock";
import { Filter } from "../../filter/Filter";
import { Errortext } from "../../../lib/models/Errortext";
import { TextFacade } from "./TextFacade";
import { SeverityFacade } from "../enum/SeverityFacade";
import { Severity } from "../../../lib/models/Severity";

/**
 * handles CRUD operations with the errortext-entity
 * Joins:
 * - texts (1:1)
 * - severities (1:1)
 */
export class ErrortextFacade extends EntityFacade<Errortext> {

    private _textFacade: TextFacade;
    private _severityFacade: SeverityFacade;

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
        this._severityFacade = new SeverityFacade();
    }

    /**
     * returns SQL-attributes for the errortexts
     * @param excludedSQLAttributes sql attributes that are excluded from the query
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["error_id", "severity_id"];

        const textAttributes: SQLAttributes = this._textFacade.getSQLAttributes(excludedSQLAttributes);
        const severityAttributes: SQLAttributes = this._severityFacade.getSQLAttributes(excludedSQLAttributes);

        const errortextAttributes: SQLAttributes = new SQLAttributes(this.tableAlias, sqlAttributes);
        errortextAttributes.addSqlAttributes(textAttributes);
        errortextAttributes.addSqlAttributes(severityAttributes);

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
        const s: Severity = this._severityFacade.fillEntity(result);

        if (result[this.name("severity_id")] !== undefined) {
            errortext.severityId = result[this.name("severity_id")];
        }

        errortext.severity = s;

        return errortext;
    }

    /**
     * creates the joins for the errortext and returns them as a list
     */
    public getJoins(): SQLJoin[] {
        const joins: SQLJoin[] = [];

        const textJoin: SQLBlock = new SQLBlock();
        textJoin.addText(`${this.tableAlias}.error_id = ${this._textFacade.tableAlias}.id`);
        joins.push(new SQLJoin(this._textFacade.tableName, this._textFacade.tableAlias, textJoin, JoinType.JOIN));

        const severityJoin: SQLBlock = new SQLBlock();
        severityJoin.addText(`${this.tableAlias}.severity_id = ${this._severityFacade.tableAlias}.id`);
        joins.push(new SQLJoin(this._severityFacade.tableName, this._severityFacade.tableAlias, severityJoin, JoinType.JOIN));

        return joins;
    }

    /**
     * returns the userFacadeFilter
     */
    public getTextFacadeFilter(): Filter {
        return this._textFacade.getFacadeFilter();
    }

}
