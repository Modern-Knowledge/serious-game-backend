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
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
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
     * fills the entity
     * @param result result for filling
     */
    protected fillEntity(result: any): HelptextGame {
        const helptextGames: HelptextGame = new HelptextGame();

        if (result[this.name("game_id")]) {
            helptextGames.gameId = result[this.name("game_id")];
        }

        if (result[this.name("helptext_id")]) {
            helptextGames.helptextId = result[this.name("helptext_id")];
        }

        return helptextGames;
    }

}
