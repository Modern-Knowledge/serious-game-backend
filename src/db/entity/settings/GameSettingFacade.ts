import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { GameSetting } from "../../../lib/models/GameSetting";

/**
 * handles CRUD operations with game-settings
 */
export class GameSettingFacade extends EntityFacade<GameSetting> {

  /**
   * @param tableAlias
   */
  public constructor(tableAlias?: string) {

    if (tableAlias) {
      super("game_settings", tableAlias);
    } else {
      super("game_settings", "gs");
    }
  }

  /**
   * returns SQL-attributes for the game-settings
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] = ["games_id", "difficulties_id"];

    return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
  }

  /**
   * returns the game-settings that match the specified filter
   * @param excludedSQLAttributes
   */
  public getGameSettings(excludedSQLAttributes?: string[]): Promise<GameSetting[]> {
    const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
    return this.select(attributes, this.getJoins());
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  protected fillEntity(result: any): GameSetting {
    const gameSetting: GameSetting = new GameSetting();

    this.fillDefaultAttributes(result, gameSetting);

    if (result[this.name("games_id")] !== undefined) {
      gameSetting.gamesId = result[this.name("games_id")];
    }

    if (result[this.name("difficulties_id")] !== undefined) {
      gameSetting.difficultyId = result[this.name("difficulties_id")];
    }


    return gameSetting;
  }

}
