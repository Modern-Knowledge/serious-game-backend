import { Errortext } from "serious-game-library/dist/models/Errortext";
import { CompositeFacade } from "../../composite/CompositeFacade";
import { Filter } from "../../filter/Filter";
import { Ordering } from "../../order/Ordering";
import { JoinCardinality } from "../../sql/enums/JoinCardinality";
import { JoinType } from "../../sql/enums/JoinType";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLBlock } from "../../sql/SQLBlock";
import { SQLJoin } from "../../sql/SQLJoin";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SeverityFacade } from "../enum/SeverityFacade";
import { TextFacade } from "./TextFacade";

/**
 * Handles CRUD operations with the errortext-entity.
 *
 * contained Facades:
 * - TextFacade
 * - SeverityFacade
 *
 * contained Joins:
 * - texts (1:1)
 * - severities (1:1)
 */
export class ErrortextFacade extends CompositeFacade<Errortext> {

    private readonly _textFacade: TextFacade;
    private _severityFacade: SeverityFacade;

    private _withTextJoin: boolean;
    private _withSeverityJoin: boolean;

    /**
     * @param tableAlias table-alias of the facade
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
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["error_id", "severity_id"];

        const errortextAttributes: SQLAttributes = new SQLAttributes(this.tableAlias, sqlAttributes);

        if (this._withTextJoin) {
            const textAttributes: SQLAttributes = this._textFacade.getSQLAttributes(excludedSQLAttributes);
            errortextAttributes.addSqlAttributes(textAttributes);
        }

        if (this._withSeverityJoin) {
            const severityAttributes: SQLAttributes = this._severityFacade.getSQLAttributes(excludedSQLAttributes);
            errortextAttributes.addSqlAttributes(severityAttributes);
        }

        return errortextAttributes;
    }

    /**
     * Inserts a new error-text and returns the created error-text.
     *
     * @param errortext error-text to insert
     */
    public async insert(errortext: Errortext): Promise<Errortext> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(errortext);

        /**
         * callback that is executed after a text was inserted
         * @param insertId text id that was inserted before
         * @param sqlValueAttributes attributes where the id is appended
         */
        const onInsertText = (insertId: number, sqlValueAttributes: SQLValueAttributes) => {
            errortext.id = insertId;
            const patientIdAttribute: SQLValueAttribute
                = new SQLValueAttribute("error_id", this.tableName, errortext.id);
            sqlValueAttributes.addAttribute(patientIdAttribute);
        };

        await this.insertStatement(attributes, [
                {facade: this._textFacade, entity: errortext, callBackOnInsert: onInsertText },
                {facade: this, entity: errortext}
            ]);

        return errortext;
    }

    /**
     * Fills the error-text-ingredient-entity from the result.
     *
     * @param result database results
     */
    public fillEntity(result: any): Errortext {
        if (!result[this.name("error_id")]) {
            return undefined;
        }

        const errortext: Errortext = new Errortext();

        if (this._withTextJoin) {
            this._textFacade.fillTextEntity(result, errortext);
        }

        if (result[this.name("severity_id")]) {
            errortext.severityId = result[this.name("severity_id")];
        }

        if (this._withSeverityJoin) {
            const severity = this._severityFacade.fillEntity(result);
            if (severity) {
                errortext.severity = severity;
            }
        }

        return errortext;
    }

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param errortext entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, errortext: Errortext): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const roleAttribute: SQLValueAttribute = new SQLValueAttribute("severity_id", prefix, errortext.severityId);
        attributes.addAttribute(roleAttribute);

        return attributes;
    }

    /**
     * Creates the joins for the errortext-facade and returns them as a list.
     */
    get joins(): SQLJoin[] {
        const joins: SQLJoin[] = [];

        if (this._withTextJoin) {
            const textJoin: SQLBlock = new SQLBlock();
            textJoin.addText(`${this.tableAlias}.error_id = ${this._textFacade.tableAlias}.id`);
            joins.push(
                new SQLJoin(this._textFacade.tableName, this._textFacade.tableAlias, textJoin,
                    JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE)
            );
        }

        if (this._withSeverityJoin) {
            const severityJoin: SQLBlock = new SQLBlock();
            severityJoin.addText(`${this.tableAlias}.severity_id = ${this._severityFacade.tableAlias}.id`);
            joins.push(new SQLJoin(
                this._severityFacade.tableName, this._severityFacade.tableAlias, severityJoin,
                JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE
            ));
        }

        return joins;
    }

    /**
     * Returns all sub facade filters of the facade as an array.
     */
    protected get filters(): Filter[] {
        return [
            this.textFacadeFilter,
            this.severityFacadeFilter
        ];
    }

    get textFacadeFilter(): Filter {
        return this._textFacade.filter;
    }

    get severityFacadeFilter(): Filter {
        return this._severityFacade.filter;
    }

    /**
     * Returns all sub facade order-bys of the facade as an array.
     */
    protected get orderBys(): Ordering[] {
        return [
            this.textFacadeOrderBy,
            this.severityFacadeOrderBy,
        ];
    }

    get textFacadeOrderBy(): Ordering {
        return this._textFacade.ordering;
    }

    get severityFacadeOrderBy(): Ordering {
        return this._severityFacade.ordering;
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

    /**
     * returns the facade filter that can be used for filtering model with id
     */
    get idFilter(): Filter {
        return this._textFacade.idFilter;
    }

}
