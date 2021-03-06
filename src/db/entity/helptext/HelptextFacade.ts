
import { Helptext } from "serious-game-library/dist/models/Helptext";
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
import { TextFacade } from "./TextFacade";

/**
 * Handles CRUD operations with the helptext-entity.
 *
 * contained Facades:
 * - TextFacade
 *
 * contained Joins:
 * - texts (1:1)
 */
export class HelptextFacade extends CompositeFacade<Helptext> {

    private readonly _textFacade: TextFacade;

    private _withTextJoin: boolean;

    /**
     * @param tableAlias table-alias for facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("helptexts", tableAlias);
        } else {
            super("helptexts", "helpt");
        }

        this._textFacade = new TextFacade("texthelp");

        this._withTextJoin = true;
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["helptext_id"];

        const helptextAttributes: SQLAttributes = new SQLAttributes(this.tableAlias, sqlAttributes);

        if (this._withTextJoin) {
            const textAttributes: SQLAttributes = this._textFacade.getSQLAttributes(excludedSQLAttributes);
            helptextAttributes.addSqlAttributes(textAttributes);
        }

        return helptextAttributes;
    }

    /**
     * Inserts a new help-text and returns the created help-text.
     * @param helptext help-text to insert
     */
    public async insert(helptext: Helptext): Promise<Helptext> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(helptext);

        /**
         * callback that is called after a text was inserted
         * @param insertId text id that was inserted before
         * @param sqlValueAttributes attributes to append to
         */
        const onInsertText = (insertId: number, sqlValueAttributes: SQLValueAttributes) => {
            helptext.id = insertId;
            const patientIdAttribute: SQLValueAttribute =
                new SQLValueAttribute("helptext_id", this.tableName, helptext.id);
            sqlValueAttributes.addAttribute(patientIdAttribute);
        };

        await this.insertStatement(attributes, [
                {facade: this._textFacade, entity: helptext, callBackOnInsert: onInsertText},
                {facade: this, entity: helptext}
            ]);

        return helptext;
    }

    /**
     * Fills the help-text-entity from the result.
     *
     * @param result database results
     */
    public fillEntity(result: any): Helptext {
        if (!result[this.name("helptext_id")]) {
            return undefined;
        }

        const helptext: Helptext = new Helptext();

        if (this._withTextJoin) {
            this._textFacade.fillTextEntity(result, helptext);
        }

        return helptext;
    }

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param helptext entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, helptext: Helptext): SQLValueAttributes {
        return new SQLValueAttributes();
    }

    /**
     * Creates the joins for the helptext-facade and returns them as a list.
     */
    get joins(): SQLJoin[] {
        const joins: SQLJoin[] = [];

        if (this._withTextJoin) {
            const textJoin: SQLBlock = new SQLBlock();
            textJoin.addText(`${this.tableAlias}.helptext_id = ${this._textFacade.tableAlias}.id`);
            joins.push(
                new SQLJoin(this._textFacade.tableName, this._textFacade.tableAlias, textJoin,
                    JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE)
            );
        }

        return joins;
    }

    /**
     * Returns all sub facade filters of the facade as an array.
     */
    protected get filters(): Filter[] {
        return [
            this.textFacadeFilter
        ];
    }

    get textFacadeFilter(): Filter {
        return this._textFacade.filter;
    }

    /**
     * Returns all sub facade order-bys of the facade as an array.
     */
    protected get orderBys(): Ordering[] {
        return [
            this.textFacadeOrderBy,
        ];
    }

    get textFacadeOrderBy(): Ordering {
        return this._textFacade.ordering;
    }

    get withTextJoin(): boolean {
        return this._withTextJoin;
    }

    set withTextJoin(value: boolean) {
        this._withTextJoin = value;
    }

    get idFilter(): Filter {
        return this._textFacade.idFilter;
    }
}
