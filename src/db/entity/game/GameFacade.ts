
import { Game } from "../../../lib/models/Game";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * Handles CRUD operations with the game-entity.
 */
export class GameFacade extends EntityFacade<Game> {
    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("games", tableAlias);
        } else {
            super("games", "g");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["name", "description", "component"];
        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * Inserts a new game and returns the created game.
     *
     * @param game game that should be inserted
     */
    public async insert(game: Game): Promise<Game> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(game);
        const result = await this.insertStatement(attributes);

        if (result.length > 0) {
            game.id = result[0].insertedId;
        }

        return game;
    }

    /**
     * Fills the game-entity from the result.
     *
     * @param result database-results
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

        if (result[this.name("component")]) {
            game.component = result[this.name("component")];
        }

        return game;
    }

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param game entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, game: Game): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const nameAttribute: SQLValueAttribute = new SQLValueAttribute("name", prefix, game.name);
        attributes.addAttribute(nameAttribute);

        const descriptionAttribute: SQLValueAttribute = new SQLValueAttribute("description", prefix, game.description);
        attributes.addAttribute(descriptionAttribute);

        const componentAttribute: SQLValueAttribute = new SQLValueAttribute("component", prefix, game.component);
        attributes.addAttribute(componentAttribute);

        return attributes;
    }
}
