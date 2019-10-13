/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { Difficulty } from "../../../lib/models/Difficulty";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";

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
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["difficulty"];

        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * inserts a new difficulty and returns the created difficulty
     * @param difficulty difficulty to insert
     */
    public async insertDifficulty(difficulty: Difficulty): Promise<Difficulty> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(difficulty);
        const result = await this.insert(attributes);

        if (result.length > 0) {
            difficulty.id = result[0].insertedId;
        }

        return difficulty;
    }

    /**
     * fills the entity
     * @param result result for filling
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

}
