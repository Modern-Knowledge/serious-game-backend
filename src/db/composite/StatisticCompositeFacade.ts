import { EntityFacade } from "../entity/EntityFacade";
import { SQLAttributes } from "../sql/SQLAttributes";
import { SQLJoin } from "../sql/SQLJoin";
import { SQLBlock } from "../sql/SQLBlock";
import { JoinType } from "../sql/JoinType";
import { Statistic } from "../../lib/models/Statistic";
import { StatisticFacade } from "../entity/game/StatisticFacade";
import { ErrortextFacade } from "../entity/helptext/ErrortextFacade";
import { ErrortextStatisticFacade } from "../entity/helptext/ErrortextStatisticFacade";
import { Errortext } from "../../lib/models/Errortext";
import {Helper} from "../../util/Helper";

/**
 * retrieves composite statistics
 * Joins:
 * - errortexts_statistics (1:n)
 * - errortexts (1:n)
 * - texts (1:1)
 * - severities (1:1)
 */
export class StatisticCompositeFacade extends EntityFacade<Statistic> {

    private _statisticFacade: StatisticFacade;
    private _errortextFacade: ErrortextFacade;
    private _errortextStatisticFacade: ErrortextStatisticFacade;

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
    }

    /**
     * @param excludedSQLAttributes
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const returnAttributes: SQLAttributes = new SQLAttributes();

        returnAttributes.addSqlAttributes(this._statisticFacade.getSQLAttributes(excludedSQLAttributes));
        returnAttributes.addSqlAttributes(this._errortextFacade.getSQLAttributes(excludedSQLAttributes));
        returnAttributes.addSqlAttributes(this._errortextStatisticFacade.getSQLAttributes(excludedSQLAttributes));

        return returnAttributes;
    }

    /**
     * returns composite statistics that match the specified filter
     * @param excludedSQLAttributes
     */
    public getStatistics(excludedSQLAttributes?: string[]): Promise<Statistic[]> {
        const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
        return this.select(attributes, this.getJoins());
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Statistic {
        const t: Statistic = this._statisticFacade.fillEntity(result);
        const et: Errortext = this._errortextFacade.fillEntity(result);

        t.addErrortext(et);

        return t;
    }

    /**
     * creates the joins for the composite statistics and returns them as a list
     */
    public getJoins(): SQLJoin[] {
        let joins: SQLJoin[] = [];

        const statisticErrortextJoin: SQLBlock = new SQLBlock();
        statisticErrortextJoin.addText(`${this._errortextStatisticFacade.tableAlias}.statistic_id = ${this.tableAlias}.id`);
        joins.push(new SQLJoin(this._errortextStatisticFacade.tableName, this._errortextStatisticFacade.tableAlias, statisticErrortextJoin, JoinType.JOIN));

        const errortextStatisticJoin: SQLBlock = new SQLBlock();
        errortextStatisticJoin.addText(`${this._errortextStatisticFacade.tableAlias}.errortext_id = ${this._errortextFacade.tableAlias}.error_id`);
        joins.push(new SQLJoin(this._errortextFacade.tableName, this._errortextFacade.tableAlias, errortextStatisticJoin, JoinType.JOIN));

        joins = joins.concat(this._errortextFacade.getJoins()); // add patient joins (user)

        return joins;
    }

    /**
     * @param entities
     */
    protected postProcessSelect(entities: Statistic[]): Statistic[] {
        const statisticMap = new Map<number, Statistic>();

        for (const statistic of entities) {
            if (!statisticMap.has(statistic.id)) {
                statisticMap.set(statistic.id, statistic)
            } else {
                const existingStatistic: Statistic = statisticMap.get(statistic.id);

                if(!Helper.arrayContainsModel(statistic.errortexts[0], existingStatistic.errortexts)) {
                    existingStatistic.addErrortexts(statistic.errortexts);
                }
            }
        }

        return Array.from(statisticMap.values());
    }
}