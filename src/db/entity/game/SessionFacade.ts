import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { Session } from "../../../lib/models/Session";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";

/**
 * handles CRUD operations with the session-entity
 */
export class SessionFacade extends EntityFacade<Session> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("sessions", tableAlias);
        } else {
            super("sessions", "sess");
        }
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        let excludedAttrDefault: string[] = [];

        if (excludedSQLAttributes) {
            excludedAttrDefault = excludedAttrDefault.concat(excludedSQLAttributes);
        }

        const sqlAttributes: string[] = ["game_id", "patient_id", "statistic_id", "therapist_id", "date", "game_setting_id"];

        return super.getSQLAttributes(excludedAttrDefault, sqlAttributes);
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Session {
        const session: Session = new Session();

        this.fillDefaultAttributes(result, session);

        if (result[this.name("id")] !== undefined) {
            session.id = result[this.name("id")];
        }

        if (result[this.name("game_id")] !== undefined) {
            session.gameId = result[this.name("game_id")];
        }

        if (result[this.name("patient_id")] !== undefined) {
            session.patientId = result[this.name("patient_id")];
        }

        if (result[this.name("statistic_id")] !== undefined) {
            session.statisticId = result[this.name("statistic_id")];
        }

        if (result[this.name("therapist_id")] !== undefined) {
            session.therapistId = result[this.name("therapist_id")];
        }

        if (result[this.name("date")] !== undefined) {
            session.date = result[this.name("date")];
        }

        if (result[this.name("game_setting_id")] !== undefined) {
            session.gameSettingId = result[this.name("game_setting_id")];
        }

        return session;
    }

    /**
     * inserts a new session and returns the created session
     * @param session
     */
    public async insertSession(session: Session): Promise<Session> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(session);

        await this.insert(attributes);

        return session;
    }

    /**
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
     * @param session entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, session: Session): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const gameIdAttribute: SQLValueAttribute = new SQLValueAttribute("game_id", prefix, session.gameId);
        attributes.addAttribute(gameIdAttribute);

        const patientIdAttribute: SQLValueAttribute = new SQLValueAttribute("patient_id", prefix, session.patientId);
        attributes.addAttribute(patientIdAttribute);

        const therapistIdAttribute: SQLValueAttribute = new SQLValueAttribute("therapist_id", prefix, session.therapistId);
        attributes.addAttribute(therapistIdAttribute);

        const statisticIdAttribute: SQLValueAttribute = new SQLValueAttribute("statistic_id", prefix, session.statisticId);
        attributes.addAttribute(statisticIdAttribute);

        const gameSettingId: SQLValueAttribute = new SQLValueAttribute("game_setting_id", prefix, session.gameSettingId);
        attributes.addAttribute(gameSettingId);

        const dateAttribute: SQLValueAttribute = new SQLValueAttribute("date", prefix, session.date);
        attributes.addAttribute(dateAttribute);

        return attributes;
    }
}
