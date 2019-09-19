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

    private _withTextJoin: boolean;
    private _withSeverityJoin: boolean;

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

        this._withTextJoin = true;
        this._withSeverityJoin = true;
    }

    /**
     * returns SQL-attributes for the errortexts
     * @param excludedSQLAttributes sql attributes that are excluded from the query
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["error_id", "severity_id"];

        const errortextAttributes: SQLAttributes = new SQLAttributes(this.tableAlias, sqlAttributes);

        if(this._withTextJoin) {
            const textAttributes: SQLAttributes = this._textFacade.getSQLAttributes(excludedSQLAttributes);
            errortextAttributes.addSqlAttributes(textAttributes);
        }
        if(this._withSeverityJoin) {
            const severityAttributes: SQLAttributes = this._severityFacade.getSQLAttributes(excludedSQLAttributes);
            errortextAttributes.addSqlAttributes(severityAttributes);
        }

        return errortextAttributes;
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Errortext {
        const errortext: Errortext = new Errortext();
        if(this._withTextJoin) {
            this._textFacade.fillTextEntity(result, errortext);
        }

        if (result[this.name("severity_id")] !== undefined) {
            errortext.severityId = result[this.name("severity_id")];
        }

        if(this._withSeverityJoin) {
            const s: Severity = this._severityFacade.fillEntity(result);
            errortext.severity = s;
        }

        return errortext;
    }

    /**
     * creates the joins for the errortext and returns them as a list
     */
    public getJoins(): SQLJoin[] {
        const joins: SQLJoin[] = [];

        if(this._withTextJoin) {
            const textJoin: SQLBlock = new SQLBlock();
            textJoin.addText(`${this.tableAlias}.error_id = ${this._textFacade.tableAlias}.id`);
            joins.push(new SQLJoin(this._textFacade.tableName, this._textFacade.tableAlias, textJoin, JoinType.JOIN));
        }

        if(this._withSeverityJoin) {
            const severityJoin: SQLBlock = new SQLBlock();
            severityJoin.addText(`${this.tableAlias}.severity_id = ${this._severityFacade.tableAlias}.id`);
            joins.push(new SQLJoin(this._severityFacade.tableName, this._severityFacade.tableAlias, severityJoin, JoinType.JOIN));
        }

        return joins;
    }

    /**
     * returns the userFacadeFilter
     */
    get textFacadeFilter(): Filter {
        return this._textFacade.filter;
    }

    get withTextJoin(): boolean {
        return this._withTextJoin;
    }

    set withTextJoin(value: boolean) {
        this._withTextJoin = value;
    }

    get withSeverityJoin(): boolean {
        return this._withSeverityJoin;
    }

    set withSeverityJoin(value: boolean) {
        this._withSeverityJoin = value;
    }
}
