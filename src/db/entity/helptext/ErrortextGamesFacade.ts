import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { ErrortextGame } from "../../../lib/models/ErrortextGame";

/**
 * handles CRUD operations with errortext-games-entity
 */
export class ErrortextGamesFacade extends EntityFacade<ErrortextGame> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("errortexts_games", tableAlias);
        } else {
            super("errortexts_games", "etga");
        }
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] =  ["errortexts_error_id", "games_id"];
        let exclDefaultAttr: string[] = ["id", "created_at", "modified_at"];

        if (excludedSQLAttributes) {
            exclDefaultAttr = exclDefaultAttr.concat(excludedSQLAttributes);
        }

        return super.getSQLAttributes(exclDefaultAttr, sqlAttributes);
    }

    /**
     * inserts a new errortextGame and returns the created errortextGame
     * @param errortextGame errortextGame to insert
     */
    public async insertErrortextGame(errortextGame: ErrortextGame): Promise<ErrortextGame> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(errortextGame);
        const result = await this.insert(attributes);

        if (result.length > 0) {
            errortextGame.id = result[0].insertedId;
        }

        return errortextGame;
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    protected fillEntity(result: any): ErrortextGame {
        const errortextGame: ErrortextGame = new ErrortextGame();

        if (result[this.name("game_id")]) {
            errortextGame.gameId = result[this.name("game_id")];
        }

        if (result[this.name("errortexts_error_id")]) {
            errortextGame.errortextsErrorId = result[this.name("errortexts_error_id")];
        }

        return errortextGame;
    }

    /**
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
     * @param errortextGame entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, errortextGame: ErrortextGame): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const gameIdAttribute: SQLValueAttribute = new SQLValueAttribute("game_id", prefix, errortextGame.gameId);
        attributes.addAttribute(gameIdAttribute);

        const errortextId: SQLValueAttribute = new SQLValueAttribute("errortexts_error_id", prefix, errortextGame.errortextsErrorId);
        attributes.addAttribute(errortextId);

        return attributes;
    }

}