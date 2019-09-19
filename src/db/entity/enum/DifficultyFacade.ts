import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { Difficulty } from "../../../lib/models/Difficulty";

/**
 * handles CRUD operations with the difficulty-entity
 */
export class DifficultyFacade extends EntityFacade<Difficulty> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("difficulties", tableAlias);
        } else {
            super("difficulties", "dif");
        }
    }

    /**
     * returns SQL-attributes for the difficulties
     * @param excludedSQLAttributes sql attributes that are excluded from the query
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["difficulty"];

        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Difficulty {
        const difficulty: Difficulty = new Difficulty();

        this.fillDefaultAttributes(result, difficulty);

        if (result[this.name("difficulty")] !== undefined) {
            difficulty.difficulty = result[this.name("difficulty")];
        }

        return difficulty;
    }

}
