import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLJoin } from "../../sql/SQLJoin";
import { JoinType } from "../../sql/enums/JoinType";
import { SQLBlock } from "../../sql/SQLBlock";
import { Filter } from "../../filter/Filter";
import { TextFacade } from "./TextFacade";
import { Helptext } from "../../../lib/models/Helptext";
import { JoinCardinality } from "../../sql/enums/JoinCardinality";
import { CompositeFacade } from "../../composite/CompositeFacade";
import { Ordering } from "../../order/Ordering";

/**
 * handles CRUD operations with the helptext-entity
 * contained Facades:
 * - TextFacade
 *
 * contained Joins:
 * - texts (1:1)
 */
export class HelptextFacade extends CompositeFacade<Helptext> {

    private _textFacade: TextFacade;

    private _withTextJoin: boolean;

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

        this._withTextJoin = true;
    }

    /**
     * returns sql attributes that should be retrieved from the database
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
     * fills the entity
     * @param result result for filling
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
     * creates the joins for the helptext facade and returns them as a list
     */
    get joins(): SQLJoin[] {
        const joins: SQLJoin[] = [];

        if (this._withTextJoin) {
            const textJoin: SQLBlock = new SQLBlock();
            textJoin.addText(`${this.tableAlias}.helptext_id = ${this._textFacade.tableAlias}.id`);
            joins.push(new SQLJoin(this._textFacade.tableName, this._textFacade.tableAlias, textJoin, JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE));
        }

        return joins;
    }

    /**
     * returns all sub facade filters of the facade as an array
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
     * returns all sub facade order-bys of the facade as an array
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
