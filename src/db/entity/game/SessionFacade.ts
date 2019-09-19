import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { Session } from "../../../lib/models/Session";

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
   * returns SQL-attributes for the sessions
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    let excludedAttrDefault: string[] = [];

    if (excludedSQLAttributes) {
      excludedAttrDefault = excludedAttrDefault.concat(excludedSQLAttributes);
    }

    const sqlAttributes: string[] = ["game_id", "patient_id", "statistic_id", "therapist_id", "date", "game_settings_id"];

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

    if (result[this.name("game_settings_id")] !== undefined) {
      session.gameSettingId = result[this.name("game_settings_id")];
    }

    return session;
  }

}
