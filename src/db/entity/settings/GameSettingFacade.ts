import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { GameSetting } from "../../../lib/models/GameSetting";
import { SQLJoin } from "../../sql/SQLJoin";
import { SQLBlock } from "../../sql/SQLBlock";
import { JoinType } from "../../sql/JoinType";
import { DifficultyFacade } from "../enum/DifficultyFacade";

/**
 * handles CRUD operations with game-settings-entity
 * Joins:
 *  - difficulties (1:1)
 */
export class GameSettingFacade extends EntityFacade<GameSetting> {

  private _difficultyFacade: DifficultyFacade;

  /**
   * @param tableAlias
   */
  public constructor(tableAlias?: string) {
    if (tableAlias) {
      super("game_settings", tableAlias);
    } else {
      super("game_settings", "gs");
    }

    this._difficultyFacade = new DifficultyFacade();
  }

  /**
   * returns SQL-attributes for the game-settings
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] = ["game_id", "difficulty_id"];

    const returnAttributes: SQLAttributes = new SQLAttributes();
    returnAttributes.addSqlAttributes(super.getSQLAttributes(excludedSQLAttributes, sqlAttributes));
    returnAttributes.addSqlAttributes(this._difficultyFacade.getSQLAttributes(excludedSQLAttributes));

    return returnAttributes
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
  public fillEntity(result: any): GameSetting {
    const gameSetting: GameSetting = new GameSetting();

    this.fillDefaultAttributes(result, gameSetting);

    if (result[this.name("game_id")] !== undefined) {
      gameSetting.gameId = result[this.name("game_id")];
    }

    if (result[this.name("difficulty_id")] !== undefined) {
      gameSetting.difficultyId = result[this.name("difficulty_id")];
    }

    gameSetting.difficulty = this._difficultyFacade.fillEntity(result);

    return gameSetting;
  }

  /**
   * creates the joins for the game-settings-entity and returns them as a list
   */
  public getJoins(): SQLJoin[] {
    const joins: SQLJoin[] = [];

    const difficultyJoin: SQLBlock = new SQLBlock();
    difficultyJoin.addText(`${this.tableAlias}.difficulty_id = ${this._difficultyFacade.tableAlias}.id`);
    joins.push(new SQLJoin(this._difficultyFacade.tableName, this._difficultyFacade.tableAlias, difficultyJoin, JoinType.JOIN));

    return joins;
  }

}
