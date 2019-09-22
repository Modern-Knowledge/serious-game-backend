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
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
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
