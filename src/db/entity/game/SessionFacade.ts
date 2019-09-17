import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { Statistic } from "../../../lib/models/Statistic";
import Session from "../../../lib/models/Session";

/**
 * handles CRUD operations with sessions-entity
 */
export class SessionFacade extends EntityFacade<Session> {

  /**
   * @param tableAlias
   */
  public constructor(tableAlias?: string) {

    if (tableAlias) {
      super("sessions", tableAlias);
    } else {
      super("sessions", "st");
    }
  }

  /**
   * returns SQL-attributes for the sessions
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    let excludedAttrDefault: string[] = ["id"]; // no id in session table

    if (excludedSQLAttributes) {
      excludedAttrDefault = excludedAttrDefault.concat(excludedSQLAttributes);
    }

    const sqlAttributes: string[] = ["games_id", "patients_id", "statistics_id", "therapists_id", "date", "game_settings_id"];

    return super.getSQLAttributes(excludedAttrDefault, sqlAttributes);
  }

  /**
   * returns sessions that match the specified filter
   * @param excludedSQLAttributes
   */
  public getSessions(excludedSQLAttributes?: string[]): Promise<Session[]> {
    const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
    return this.select(attributes, this.getJoins());
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  protected fillEntity(result: any): Session {
    const session: Session = new Session();

    this.fillDefaultAttributes(result, session);

    if (result[this.name("games_id")] !== undefined) {
      session.gamesId = result[this.name("games_id")];
    }

    if (result[this.name("patients_id")] !== undefined) {
      session.patientsId = result[this.name("patients_id")];
    }

    if (result[this.name("statistics_id")] !== undefined) {
      session.statisticsId = result[this.name("statistics_id")];
    }

    if (result[this.name("therapists_id")] !== undefined) {
      session.statisticsId = result[this.name("therapists_id")];
    }

    if (result[this.name("date")] !== undefined) {
      session.date = result[this.name("date")];
    }

    if (result[this.name("game_settings_id")] !== undefined) {
      session.gameSettingsId = result[this.name("game_settings_id")];
    }

    return session;
  }

}
