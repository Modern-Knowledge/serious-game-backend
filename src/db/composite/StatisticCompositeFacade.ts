import { Errortext } from "serious-game-library/dist/models/Errortext";
import { Statistic } from "serious-game-library/dist/models/Statistic";
import { arrayContainsModel } from "../../util/Helper";
import { StatisticFacade } from "../entity/game/StatisticFacade";
import { ErrortextFacade } from "../entity/helptext/ErrortextFacade";
import { ErrortextStatisticFacade } from "../entity/helptext/ErrortextStatisticFacade";
import { Filter } from "../filter/Filter";
import { Ordering } from "../order/Ordering";
import { JoinCardinality } from "../sql/enums/JoinCardinality";
import { JoinType } from "../sql/enums/JoinType";
import { SQLAttributes } from "../sql/SQLAttributes";
import { SQLBlock } from "../sql/SQLBlock";
import { SQLJoin } from "../sql/SQLJoin";
import { CompositeFacade } from "./CompositeFacade";

/**
 * Retrieve statistics with the error-texts.
 *
 * contained Facades:
 * - StatisticFacade
 * - ErrortextFacade
 * - ErrortextStatisticFacade
 *
 * contained Joins:
 * - errortexts_statistics (1:n)
 * - errortexts (1:n)
 *   - texts (1:1)
 * - severities (1:1)
 */
export class StatisticCompositeFacade extends CompositeFacade<Statistic> {

    /**
     * Creates the joins for the statistics-facade and returns them as a list.
     */
    get joins(): SQLJoin[] {
        let joins: SQLJoin[] = [];

        if (this._withErrortextJoin) {
            const statisticErrortextJoin: SQLBlock = new SQLBlock();
            statisticErrortextJoin.addText(
                `${this._errortextStatisticFacade.tableAlias}.statistic_id = ${this.tableAlias}.id`
            );
            joins.push(new SQLJoin(
                this._errortextStatisticFacade.tableName, this._errortextStatisticFacade.tableAlias,
                statisticErrortextJoin, JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_MANY)
            );

            const errortextStatisticJoin: SQLBlock = new SQLBlock();
            errortextStatisticJoin.addText(
                `${this._errortextStatisticFacade.tableAlias}.errortext_id = ` +
                `${this._errortextFacade.tableAlias}.error_id`
            );
            joins.push(new SQLJoin(
                this._errortextFacade.tableName, this._errortextFacade.tableAlias,
                errortextStatisticJoin, JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE)
            );

            joins = joins.concat(this._errortextFacade.joins); // add errortext joins (text, severity)
        }

        return joins;
    }

    /**
     * Returns all sub-facade filters of the facade as an array.
     */
    protected get filters(): Filter[] {
        return [
            this.errortextFacadeFilter,
            this.severityFacadeFilter,
            this.textFacadeFilter,
            this.errortextStatisticFilter
        ];
    }

    get severityFacadeFilter(): Filter {
        return this._errortextFacade.severityFacadeFilter;
    }

    get errortextFacadeFilter(): Filter {
        return this._errortextFacade.filter;
    }

    get textFacadeFilter(): Filter {
        return this._errortextFacade.textFacadeFilter;
    }

    get errortextStatisticFilter(): Filter {
        return this._errortextStatisticFacade.filter;
    }

    /**
     * Returns all sub-facade order-bys of the facade as an array.
     */
    protected get orderBys(): Ordering[] {
        return [
            this.severityFacadeOrderBy,
            this.statisticFacadeOrderBy,
            this.errortextFacadeOrderBy,
            this.textFacadeOrderBy
        ];
    }

    get severityFacadeOrderBy(): Ordering {
        return this._errortextFacade.severityFacadeOrderBy;
    }

    get statisticFacadeOrderBy(): Ordering {
        return this._statisticFacade.ordering;
    }

    get errortextFacadeOrderBy(): Ordering {
        return this._errortextFacade.ordering;
    }

    get textFacadeOrderBy(): Ordering {
        return this._errortextFacade.textFacadeOrderBy;
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

    get errortextFacade(): ErrortextFacade {
        return this._errortextFacade;
    }

    get errortextStatisticFacade(): ErrortextStatisticFacade {
        return this._errortextStatisticFacade;
    }

    private _statisticFacade: StatisticFacade;
    private readonly _errortextFacade: ErrortextFacade;
    private readonly _errortextStatisticFacade: ErrortextStatisticFacade;

    private _withErrortextJoin: boolean;
    private _withTextJoin: boolean;
    private _withSeverityJoin: boolean;

    /**
     * @param tableAlias table-alias of the composite facade
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
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
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
     * Fills the statistic-entity from the result. Joined entities are added to
     * the statistic.
     *
     * @param result database-results
     */
    public fillEntity(result: any): Statistic {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const t: Statistic = this._statisticFacade.fillEntity(result);

        if (this._withErrortextJoin) {
            const et: Errortext = this._errortextFacade.fillEntity(result);
            if (et) {
                t.errortexts.push(et);
            }
        }

        return t;
    }

    /**
     * Deletes the statistic and the errortext-statistic.
     */
    public async delete(): Promise<number> {
        return await this.deleteStatement([this._errortextStatisticFacade, this]);
    }

    /**
     * Post process the results of the select-query.
     * e.g.: Handle joined result set.
     *
     * @param entities entities that where returned from the database
     */
    protected postProcessSelect(entities: Statistic[]): Statistic[] {
        const statisticMap = new Map<number, Statistic>();

        for (const statistic of entities) {
            if (!statisticMap.has(statistic.id)) {
                statisticMap.set(statistic.id, statistic);
            } else {
                const existingStatistic: Statistic = statisticMap.get(statistic.id);

                existingStatistic.errortexts = existingStatistic.errortexts.concat(statistic.errortexts);
            }
        }

        return Array.from(statisticMap.values());
    }
}
