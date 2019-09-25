import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { Statistic } from "../../../lib/models/Statistic";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";

/**
 * handles CRUD operations with the statistic-entity
 */
export class StatisticFacade extends EntityFacade<Statistic> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("statistics", tableAlias);
        } else {
            super("statistics", "st");
        }
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["starttime", "endtime"];

        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Statistic {
        const statistic: Statistic = new Statistic();

        this.fillDefaultAttributes(result, statistic);

        if (result[this.name("starttime")] !== undefined) {
            statistic.startTime = result[this.name("starttime")];
        }

        if (result[this.name("endtime")] !== undefined) {
            statistic.endTime = result[this.name("endtime")];
        }

        return statistic;
    }

    /**
     * inserts a new statistic and returns the created user
     * @param statistic Statistic to insert
     */
    public async insertStatistic(statistic: Statistic): Promise<Statistic> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(statistic);

        await this.insert(attributes);

        return statistic;
    }

    /**
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
     * @param statistic entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, statistic: Statistic): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const starttimeAttribute: SQLValueAttribute = new SQLValueAttribute("starttime", prefix, statistic.startTime);
        attributes.addAttribute(starttimeAttribute);

        const endtimeAttribute: SQLValueAttribute = new SQLValueAttribute("endtime", prefix, statistic.endTime);
        attributes.addAttribute(endtimeAttribute);

        return attributes;
    }

}
