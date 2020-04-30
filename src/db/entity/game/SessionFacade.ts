import { Session } from "serious-game-library/dist/models/Session";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * Handles CRUD operations with the session-entity.
 */
export class SessionFacade extends EntityFacade<Session> {

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("sessions", tableAlias);
        } else {
            super("sessions", "sess");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        let excludedAttrDefault: string[] = [];

        if (excludedSQLAttributes) {
            excludedAttrDefault = excludedAttrDefault.concat(excludedSQLAttributes);
        }

        const sqlAttributes: string[] = ["game_id", "patient_id", "statistic_id", "date", "game_setting_id"];

        return super.getSQLAttributes(excludedAttrDefault, sqlAttributes);
    }

    /**
     * Fills the session-entity from the result.
     *
     * @param result database results
     */
    public fillEntity(result: any): Session {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const session: Session = new Session();

        this.fillDefaultAttributes(result, session);

        if (result[this.name("game_id")]) {
            session.gameId = result[this.name("game_id")];
        }

        if (result[this.name("patient_id")]) {
            session.patientId = result[this.name("patient_id")];
        }

        if (result[this.name("statistic_id")]) {
            session.statisticId = result[this.name("statistic_id")];
        }

        if (result[this.name("date")]) {
            session.date = result[this.name("date")];
        }

        if (result[this.name("game_setting_id")]) {
            session.gameSettingId = result[this.name("game_setting_id")];
        }

        return session;
    }

    /**
     * Inserts a new session and returns the created session.
     *
     * @param session session to insert
     */
    public async insert(session: Session): Promise<Session> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(session);

        const result = await this.insertStatement(attributes);

        if (result.length > 0) {
           session.id = result[0].insertedId;
        }

        return session;
    }

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param session entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, session: Session): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const gameIdAttribute: SQLValueAttribute = new SQLValueAttribute("game_id", prefix, session.gameId);
        attributes.addAttribute(gameIdAttribute);

        const patientIdAttribute: SQLValueAttribute = new SQLValueAttribute("patient_id", prefix, session.patientId);
        attributes.addAttribute(patientIdAttribute);

        const statisticIdAttribute: SQLValueAttribute
            = new SQLValueAttribute("statistic_id", prefix, session.statisticId);
        attributes.addAttribute(statisticIdAttribute);

        const gameSettingId: SQLValueAttribute
            = new SQLValueAttribute("game_setting_id", prefix, session.gameSettingId);
        attributes.addAttribute(gameSettingId);

        const dateAttribute: SQLValueAttribute = new SQLValueAttribute("date", prefix, session.date);
        attributes.addAttribute(dateAttribute);

        return attributes;
    }
}
