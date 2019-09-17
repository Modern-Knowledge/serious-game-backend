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
   * returns SQL-attributes for the games
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] =  ["name", "description"];
    return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
  }

  /**
   * returns games that match the specified filter
   * @param excludedSQLAttributes
   */
  public getGames(excludedSQLAttributes?: string[]): Promise<Game[]> {
    const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
    return this.select(attributes, this.getJoins());
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  protected fillEntity(result: any): Game {
    const game: Game = new Game();

    this.fillDefaultAttributes(result, game);

    if (result[this.name("name")] !== undefined) {
      game.name = result[this.name("name")];
    }

    if (result[this.name("description")] !== undefined) {
      game.description = result[this.name("description")];
    }

    return game;
  }

}
