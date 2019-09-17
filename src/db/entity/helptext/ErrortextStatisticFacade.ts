import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { ErrortextStatistic } from "../../../lib/models/ErrortextStatistic";

/**
 * handles CRUD operations with errortext-statistic-entity
 */
export class ErrortextStatisticFacade extends EntityFacade<ErrortextStatistic> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("errortexts_statistics", tableAlias);
        } else {
            super("errortexts_statistics", "erst");
        }
    }

    /**
     * returns SQL-attributes for errortext-statistic
     * @param excludedSQLAttributes sql attributes that are excluded from the query
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] =  ["errortext_id", "statistic_id"];
        let exclDefaultAttr: string[] = ["id", "created_at", "modified_at"];

        if (excludedSQLAttributes) {
            exclDefaultAttr = exclDefaultAttr.concat(excludedSQLAttributes);
        }

        return super.getSQLAttributes(exclDefaultAttr, sqlAttributes);
    }

    /**
     * returns errortext-statistic that match the specified filter
     * @param excludedSQLAttributes
     */
    public getErrortextStatistics(excludedSQLAttributes?: string[]): Promise<ErrortextStatistic[]> {
        const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
        return this.select(attributes, this.getJoins());
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    protected fillEntity(result: any): ErrortextStatistic {
        const errortextStatistic: ErrortextStatistic = new ErrortextStatistic();

        if (result[this.name("errortext_id")] !== undefined) {
            errortextStatistic.errortextId = result[this.name("errortext_id")];
        }

        if (result[this.name("statistic_id")] !== undefined) {
            errortextStatistic.statisticId = result[this.name("statistic_id")];
        }

        return errortextStatistic;
    }

}
