/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { Recipe } from "../../../lib/models/Recipe";

/**
 * handles CRUD operations with the recipe-entity
 */
export class RecipeFacade extends EntityFacade<Recipe> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("recipes", tableAlias);
        } else {
            super("recipes", "rec");
        }
    }

    /**
     * returns SQL-attributes for the recipes
     * @param excludedSQLAttributes sql attributes that are excluded from the query
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] =  ["name", "description", "difficulty_id"];
        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Recipe {
        const recipe: Recipe = new Recipe();

        this.fillDefaultAttributes(result, recipe);

        if (result[this.name("name")] !== undefined) {
            recipe.name = result[this.name("name")];
        }

        if (result[this.name("description")] !== undefined) {
            recipe.description = result[this.name("description")];
        }

        if (result[this.name("difficulty_id")] !== undefined) {
            recipe.difficultyId = result[this.name("difficulty_id")];
        }

        return recipe;
    }

}
