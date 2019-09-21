/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { EntityFacade } from "../EntityFacade";
import { Ingredient } from "../../../lib/models/Ingredient";
import { SQLAttributes } from "../../sql/SQLAttributes";

/**
 * handles CRUD operations with the ingredient-entity
 */
export class IngredientFacade extends EntityFacade<Ingredient> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("ingredients", tableAlias);
        } else {
            super("ingredients", "ig");
        }
    }

    /**
     * returns SQL-attributes for the ingredients
     * @param excludedSQLAttributes sql attributes that are excluded from the query
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] =  ["name", "image_id", "food_category_id"];
        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Ingredient {
        const ingredient: Ingredient = new Ingredient();

        this.fillDefaultAttributes(result, ingredient);

        if (result[this.name("name")] !== undefined) {
            ingredient.name = result[this.name("name")];
        }

        if (result[this.name("image_id")] !== undefined) {
            ingredient.imageId = result[this.name("image_id")];
        }

        if (result[this.name("food_category_id")] !== undefined) {
            ingredient.foodCategoryId = result[this.name("food_category_id")];
        }

        return ingredient;
    }

}
