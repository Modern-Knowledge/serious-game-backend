import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { Game } from "../../../lib/models/Game";

/**
 * handles CRUD operations with the game-entity
 */
export class GameFacade extends EntityFacade<Game> {

  /**
   * @param tableAlias
   */
  public constructor(tableAlias?: string) {
    if (tableAlias) {
      super("games", tableAlias);
    } else {
      super("games", "g");
    }
  }

  /**
   * returns sql attributes that should be retrieved from the database
   * @param excludedSQLAttributes attributes that should not be selected
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] =  ["name", "description"];
    return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  public fillEntity(result: any): Game {
    if (!result[this.name("id")]) {
      return undefined;
    }

    const game: Game = new Game();

    this.fillDefaultAttributes(result, game);

    if (result[this.name("name")]) {
      game.name = result[this.name("name")];
    }

    if (result[this.name("description")]) {
      game.description = result[this.name("description")];
    }

    return game;
  }

}
