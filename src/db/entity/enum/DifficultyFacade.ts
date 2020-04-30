
import { Difficulty } from "serious-game-library/dist/models/Difficulty";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * Handles CRUD operations with the difficulty-entity.
 */
export class DifficultyFacade extends EntityFacade<Difficulty> {

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("difficulties", tableAlias);
        } else {
            super("difficulties", "dif");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["difficulty"];

        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * Inserts a new difficulty and returns the created difficulty.
     *
     * @param difficulty difficulty to insert
     */
    public async insert(difficulty: Difficulty): Promise<Difficulty> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(difficulty);
        const result = await this.insertStatement(attributes);

        if (result.length > 0) {
            difficulty.id = result[0].insertedId;
        }

        return difficulty;
    }

    /**
     * Fills the difficulty-entity from the result.
     *
     * @param result database-results
     */
    public fillEntity(result: any): Difficulty {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const difficulty: Difficulty = new Difficulty();

        this.fillDefaultAttributes(result, difficulty);

        if (result[this.name("difficulty")]) {
            difficulty.difficulty = result[this.name("difficulty")];
        }

        return difficulty;
    }

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql attribute
     * @param difficulty entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, difficulty: Difficulty): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const difficultyAttribute: SQLValueAttribute =
            new SQLValueAttribute("difficulty", prefix, difficulty.difficulty);
        attributes.addAttribute(difficultyAttribute);

        return attributes;
    }

}
