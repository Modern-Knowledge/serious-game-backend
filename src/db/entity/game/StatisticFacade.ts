import {Session} from "../../../lib/models/Session";
import { Statistic } from "../../../lib/models/Statistic";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";
import {SessionFacade} from "./SessionFacade";

/**
 * Handles CRUD operations with the statistic-entity.
 */
export class StatisticFacade extends EntityFacade<Statistic> {

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("statistics", tableAlias);
        } else {
            super("statistics", "st");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["starttime", "endtime"];
        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * Fills the statistic-entity from the result.
     *
     * @param result database results
     */
    public fillEntity(result: any): Statistic {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const statistic: Statistic = new Statistic();

        this.fillDefaultAttributes(result, statistic);

        if (result[this.name("starttime")]) {
            statistic.startTime = result[this.name("starttime")];
        }

        if (result[this.name("endtime")]) {
            statistic.endTime = result[this.name("endtime")];
        }

        return statistic;
    }

    /**
     * Inserts a new statistic and returns the created statistic.
     *
     * @param statistic Statistic to insert
     */
    public async insert(statistic: Statistic): Promise<Statistic> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(statistic);

        const result = await this.insertStatement(attributes);

        if (result.length > 0) {
            statistic.id = result[0].insertedId;
        }

        return statistic;
    }

    /**
     * Inserts a new statistic and session.
     *
     * @param statistic statistic to insert
     * @param session session to insert
     */
    public async insertStatisticSession(statistic: Statistic, session: Session): Promise<Session> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(statistic);

        const callBackOnInsert = (insertId: number, sqlValueAttributes: SQLValueAttributes) => {
            session.statisticId = insertId;
            statistic.id = insertId;
            session.statistic = statistic;

            const patientIdAttribute =
                new SQLValueAttribute("statistic_id", new SessionFacade().tableName, insertId);
            sqlValueAttributes.addAttribute(patientIdAttribute);
        };

        const result = await this.insertStatement(attributes, [
            {facade: this, entity: statistic, callBackOnInsert},
            {facade: new SessionFacade(), entity: session},
        ]);

        if (result.length > 0) {
            session.id = result[result.length - 1].insertedId;
        }

        return session;
    }

    /**
     * Updates the given statistic in the database and returns the number of affected rows.
     *
     * @param statistic statistic that should be updated
     */
    public async update(statistic: Statistic): Promise<number> {
        const attributes: SQLValueAttributes = this.getSQLUpdateValueAttributes(statistic);
        return await this.updateStatement(attributes);
    }

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
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
