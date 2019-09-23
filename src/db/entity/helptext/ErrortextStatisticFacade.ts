import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { ErrortextStatistic } from "../../../lib/models/ErrortextStatistic";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";

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

    /**
     * inserts a new errortext-statistic and returns the created errortext-statistic
     * @param errortextStatistic
     */
    public insertErrortextStatistic(errortextStatistic: ErrortextStatistic): Promise<ErrortextStatistic> {
        const attributes: SQLValueAttributes = this.getSQLValueAttributes(this.tableAlias, errortextStatistic);

        return new Promise<ErrortextStatistic>((resolve, reject) => {
            this.insert(attributes).then(id => {
                resolve(errortextStatistic);
            });
        });
    }

    /**
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
     * @param errortextStatistic entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, errortextStatistic: ErrortextStatistic): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const statisticIdAttribute: SQLValueAttribute = new SQLValueAttribute("statistic_id", prefix, errortextStatistic.statisticId);
        attributes.addAttribute(statisticIdAttribute);

        const errortextIdAttribute: SQLValueAttribute = new SQLValueAttribute("errortext_id", prefix, errortextStatistic.errortextId);
        attributes.addAttribute(errortextIdAttribute);

        return attributes;
    }

}
