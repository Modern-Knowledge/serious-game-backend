import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { HelptextGame } from "../../../lib/models/HelptextGame";

/**
 * handles CRUD operations with helptexts-games-entity
 */
export class HelptextsGamesFacade extends EntityFacade<HelptextGame> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("helptexts_games", tableAlias);
        } else {
            super("helptexts_games", "hega");
        }
    }

    /**
     * returns SQL-attributes for helptexts-games
     * @param excludedSQLAttributes sql attributes that are excluded from the query
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] =  ["game_id", "helptext_id"];
        let exclDefaultAttr: string[] = ["id", "created_at", "modified_at"];

        if (excludedSQLAttributes) {
            exclDefaultAttr = exclDefaultAttr.concat(excludedSQLAttributes);
        }

        return super.getSQLAttributes(exclDefaultAttr, sqlAttributes);
    }

    /**
     * returns helptexts-games that match the specified filter
     * @param excludedSQLAttributes
     */
    public getHelptextsGames(excludedSQLAttributes?: string[]): Promise<HelptextGame[]> {
        const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
        return this.select(attributes, this.getJoins());
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    protected fillEntity(result: any): HelptextGame {
        const helptextGames: HelptextGame = new HelptextGame();

        if (result[this.name("game_id")] !== undefined) {
            helptextGames.gameId = result[this.name("game_id")];
        }

        if (result[this.name("helptext_id")] !== undefined) {
            helptextGames.helptextId = result[this.name("helptext_id")];
        }

        return helptextGames;
    }

}
