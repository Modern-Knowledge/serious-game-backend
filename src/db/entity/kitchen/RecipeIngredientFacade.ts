/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { RecipeIngredient } from "../../../lib/models/RecipeIngredient";

/**
 * handles CRUD operations with the recipes-ingredients-entity
 */
export class RecipeIngredientFacade extends EntityFacade<RecipeIngredient> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("recipes_ingredients", tableAlias);
        } else {
            super("recipes_ingredients", "recing");
        }
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] =  ["name", "description", "difficulty_id"];
        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): RecipeIngredient {
        const recipeIngredient: RecipeIngredient = new RecipeIngredient();

        this.fillDefaultAttributes(result, recipeIngredient);

        if (result[this.name("recipe_id")] !== undefined) {
            recipeIngredient.recipeId = result[this.name("recipe_id")];
        }

        if (result[this.name("ingredient_id")] !== undefined) {
            recipeIngredient.ingredientId = result[this.name("ingredient_id")];
        }

        return recipeIngredient;
    }

}
