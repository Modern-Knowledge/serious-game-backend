import { HelptextGame } from "serious-game-library/dist/models/HelptextGame";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * Handles CRUD operations with helptexts-games-entity.
 */
export class HelptextsGamesFacade extends EntityFacade<HelptextGame> {

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("helptexts_games", tableAlias);
        } else {
            super("helptexts_games", "hega");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
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
     * Inserts a new helptext-game and returns the created helptext-game.
     *
     * @param helptextGames helptext-game to insert
     */
    public async insert(helptextGames: HelptextGame): Promise<HelptextGame> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(helptextGames);
        const result = await this.insertStatement(attributes);

        if (result.length > 0) {
            helptextGames.id = result[0].insertedId;
        }

        return helptextGames;
    }

    /**
     * Fills the help-text-games-entity from the result.
     *
     * @param result database results
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

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param helptextGame entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, helptextGame: HelptextGame): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const gameIdAttribute: SQLValueAttribute = new SQLValueAttribute("game_id", prefix, helptextGame.gameId);
        attributes.addAttribute(gameIdAttribute);

        const helptextId: SQLValueAttribute = new SQLValueAttribute("helptext_id", prefix, helptextGame.helptextId);
        attributes.addAttribute(helptextId);

        return attributes;
    }

}
