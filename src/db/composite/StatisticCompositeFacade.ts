import { SQLAttributes } from "../sql/SQLAttributes";
import { SQLJoin } from "../sql/SQLJoin";
import { SQLBlock } from "../sql/SQLBlock";
import { JoinType } from "../sql/enums/JoinType";
import { Statistic } from "../../lib/models/Statistic";
import { StatisticFacade } from "../entity/game/StatisticFacade";
import { ErrortextFacade } from "../entity/helptext/ErrortextFacade";
import { ErrortextStatisticFacade } from "../entity/helptext/ErrortextStatisticFacade";
import { Errortext } from "../../lib/models/Errortext";
import { Helper } from "../../util/Helper";
import { Filter } from "../filter/Filter";
import { JoinCardinality } from "../sql/enums/JoinCardinality";
import { CompositeFacade } from "./CompositeFacade";

/**
 * retrieves composite statistics
 * contained Facades:
 * - StatisticFacade
 * - ErrortextFacade
 * - ErrortextStatisticFacade
 * contained Joins:
 * - errortexts_statistics (1:n)
 * - errortexts (1:n)
 * - texts (1:1)
 * - severities (1:1)
 */
export class StatisticCompositeFacade extends CompositeFacade<Statistic> {

    private _statisticFacade: StatisticFacade;
    private _errortextFacade: ErrortextFacade;
    private _errortextStatisticFacade: ErrortextStatisticFacade;

    private _withErrortextJoin: boolean;
    private _withTextJoin: boolean;
    private _withSeverityJoin: boolean;

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("statistics", tableAlias);
        } else {
            super("statistics", "st");
        }

        this._statisticFacade = new StatisticFacade();
        this._errortextFacade = new ErrortextFacade();
        this._errortextStatisticFacade = new ErrortextStatisticFacade();

        this._withErrortextJoin = true;
        this._withTextJoin = true;
        this._withSeverityJoin = true;
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const returnAttributes: SQLAttributes = new SQLAttributes();

        returnAttributes.addSqlAttributes(this._statisticFacade.getSQLAttributes(excludedSQLAttributes));

        if (this._withErrortextJoin) {
            returnAttributes.addSqlAttributes(this._errortextFacade.getSQLAttributes(excludedSQLAttributes));
            returnAttributes.addSqlAttributes(this._errortextStatisticFacade.getSQLAttributes(excludedSQLAttributes));
        }

        return returnAttributes;
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Statistic {
        const t: Statistic = this._statisticFacade.fillEntity(result);

        if (this._withErrortextJoin) {
            const et: Errortext = this._errortextFacade.fillEntity(result);
            t.errortexts.push(et);
        }

        return t;
    }

    /**
     * creates the joins for the composite statistics facade and returns them as a list
     */
    get joins(): SQLJoin[] {
        let joins: SQLJoin[] = [];

        if (this._withErrortextJoin) {
            const statisticErrortextJoin: SQLBlock = new SQLBlock();
            statisticErrortextJoin.addText(`${this._errortextStatisticFacade.tableAlias}.statistic_id = ${this.tableAlias}.id`);
            joins.push(new SQLJoin(this._errortextStatisticFacade.tableName, this._errortextStatisticFacade.tableAlias, statisticErrortextJoin, JoinType.JOIN, JoinCardinality.ONE_TO_MANY));

            const errortextStatisticJoin: SQLBlock = new SQLBlock();
            errortextStatisticJoin.addText(`${this._errortextStatisticFacade.tableAlias}.errortext_id = ${this._errortextFacade.tableAlias}.error_id`);
            joins.push(new SQLJoin(this._errortextFacade.tableName, this._errortextFacade.tableAlias, errortextStatisticJoin, JoinType.JOIN, JoinCardinality.ONE_TO_ONE));

            joins = joins.concat(this._errortextFacade.joins); // add errortext joins (text, severity)
        }


        return joins;
    }

    /**
     * post process the results of the select query
     * e.g.: handle joins
     * @param entities entities that where returned from the database
     */
    protected postProcessSelect(entities: Statistic[]): Statistic[] {
        const statisticMap = new Map<number, Statistic>();

        for (const statistic of entities) {
            if (!statisticMap.has(statistic.id)) {
                statisticMap.set(statistic.id, statistic);
            } else {
                const existingStatistic: Statistic = statisticMap.get(statistic.id);

                if (!Helper.arrayContainsModel(statistic.errortexts[0], existingStatistic.errortexts)) {
                    existingStatistic.errortexts = existingStatistic.errortexts.concat(statistic.errortexts);
                }
            }
        }

        return Array.from(statisticMap.values());
    }

    /**
     * returns all sub facade filters of the facade as an array
     */
    protected get filters(): Filter[] {
        return [
            this.statisticFacadeFilter,
            this.errortextFacadeFilter,
        ];
    }

    get statisticFacadeFilter(): Filter {
        return this._statisticFacade.filter;
    }

    get errortextFacadeFilter(): Filter {
        return this._errortextFacade.filter;
    }

    get withErrortextJoin(): boolean {
        return this._withErrortextJoin;
    }

    set withErrortextJoin(value: boolean) {
        this._withErrortextJoin = value;
    }

    get withTextJoin(): boolean {
        return this._withTextJoin;
    }

    set withTextJoin(value: boolean) {
        this._errortextFacade.withTextJoin = value;
        this._withTextJoin = value;
    }

    get withSeverityJoin(): boolean {
        return this._withSeverityJoin;
    }

    set withSeverityJoin(value: boolean) {
        this._errortextFacade.withSeverityJoin = value;
        this._withSeverityJoin = value;
    }
}