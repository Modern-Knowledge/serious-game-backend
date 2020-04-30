import { ErrortextGame } from "serious-game-library/dist/models/ErrortextGame";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * Handles CRUD operations with errortext-games-entity.
 */
export class ErrortextGamesFacade extends EntityFacade<ErrortextGame> {

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("errortexts_games", tableAlias);
        } else {
            super("errortexts_games", "etga");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] =  ["error_id", "game_id"];
        let exclDefaultAttr: string[] = ["id", "created_at", "modified_at"];

        if (excludedSQLAttributes) {
            exclDefaultAttr = exclDefaultAttr.concat(excludedSQLAttributes);
        }

        return super.getSQLAttributes(exclDefaultAttr, sqlAttributes);
    }

    /**
     * Inserts a new error-text-game and returns the created error-text-game.
     *
     * @param errortextGame error-text-game to insert
     */
    public async insert(errortextGame: ErrortextGame): Promise<ErrortextGame> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(errortextGame);
        const result = await this.insertStatement(attributes);

        if (result.length > 0) {
            errortextGame.id = result[0].insertedId;
        }

        return errortextGame;
    }

    /**
     * Fills the error-text-games-entity from the result.
     *
     * @param result database results
     */
    protected fillEntity(result: any): ErrortextGame {
        const errortextGame: ErrortextGame = new ErrortextGame();

        if (result[this.name("game_id")]) {
            errortextGame.gameId = result[this.name("game_id")];
        }

        if (result[this.name("error_id")]) {
            errortextGame.errorId = result[this.name("error_id")];
        }

        return errortextGame;
    }

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param errortextGame entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, errortextGame: ErrortextGame): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const gameIdAttribute: SQLValueAttribute = new SQLValueAttribute("game_id", prefix, errortextGame.gameId);
        attributes.addAttribute(gameIdAttribute);

        const errortextId: SQLValueAttribute = new SQLValueAttribute("error_id", prefix, errortextGame.errorId);
        attributes.addAttribute(errortextId);

        return attributes;
    }

}
