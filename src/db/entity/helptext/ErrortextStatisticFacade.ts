import moment from "moment";
import { ErrortextStatistic } from "serious-game-library/dist/models/ErrortextStatistic";
import {formatDateTime} from "serious-game-library/dist/utils/dateFormatter";
import {databaseConnection} from "../../../util/db/databaseConnection";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * Handles CRUD operations with errortext-statistic-entity.
 */
export class ErrortextStatisticFacade extends EntityFacade<ErrortextStatistic> {

    /**
     * @param tableAlias table-alias for errortext-statistic-facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("errortexts_statistics", tableAlias);
        } else {
            super("errortexts_statistics", "erst");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] =  ["errortext_id", "statistic_id"];
        let excludedAttrDefault: string[] = [];

        if (excludedSQLAttributes) {
            excludedAttrDefault = excludedAttrDefault.concat(excludedSQLAttributes);
        }
        return super.getSQLAttributes(excludedAttrDefault, sqlAttributes);
    }

    /**
     * Inserts a new errortext-statistic and returns the created errortext-statistic.
     *
     * @param errortextStatistic errortext-statistic to insert
     */
    public async insert(errortextStatistic: ErrortextStatistic): Promise<ErrortextStatistic> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(errortextStatistic);
        const result = await this.insertStatement(attributes);

        if (result.length > 0) {
            errortextStatistic.id = result[0].insertedId;
        }

        return errortextStatistic;
    }

    /**
     * Inserts multiple errortext-statistics and returns the created errortext-statistics.
     *
     * @param errortextStatistics errortext-statistic[] to insert
     */
    public async insertBatch(errortextStatistics: ErrortextStatistic[]): Promise<ErrortextStatistic[]> {
        const toReplace = Array(3).fill("\\?");
        const queries = [];
        for (const item of errortextStatistics) {
            const insertQuery = this.getInsertQuery(this.getSQLInsertValueAttributes(item));
            const params = insertQuery.params;
            params[params.length - 1] = moment(params[params.length - 1]).format("YYYY-MM-DD hh:mm::ss");
            let query = insertQuery.query;

            toReplace.forEach((tag, i: number) => query = query.replace(new RegExp(tag), "'" + params[i] + "'"));
            queries.push(query);
        }

        await databaseConnection.transactionQuery(queries.join("; "));

        return errortextStatistics;
    }

    /**
     * Fills the error-text-statistic-entity from the result.
     *
     * @param result database results
     */
    protected fillEntity(result: any): ErrortextStatistic {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const errortextStatistic: ErrortextStatistic = new ErrortextStatistic();

        this.fillDefaultAttributes(result, errortextStatistic);

        if (result[this.name("errortext_id")]) {
            errortextStatistic.errortextId = result[this.name("errortext_id")];
        }

        if (result[this.name("statistic_id")]) {
            errortextStatistic.statisticId = result[this.name("statistic_id")];
        }

        return errortextStatistic;
    }

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param errortextStatistic entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, errortextStatistic: ErrortextStatistic): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const statisticIdAttribute: SQLValueAttribute =
            new SQLValueAttribute("statistic_id", prefix, errortextStatistic.statisticId);
        attributes.addAttribute(statisticIdAttribute);

        const errortextIdAttribute: SQLValueAttribute =
            new SQLValueAttribute("errortext_id", prefix, errortextStatistic.errortextId);
        attributes.addAttribute(errortextIdAttribute);

        return attributes;
    }

}
