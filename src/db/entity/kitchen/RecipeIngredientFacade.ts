

import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { RecipeIngredient } from "../../../lib/models/RecipeIngredient";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";

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
        const sqlAttributes: string[] =  ["recipe_id", "ingredient_id"];
        let excludedDefaultAttributes: string[] = ["id"];

        if (excludedSQLAttributes) {
            excludedDefaultAttributes = excludedDefaultAttributes.concat(excludedSQLAttributes);
        }

        return super.getSQLAttributes(excludedDefaultAttributes, sqlAttributes);
    }

    /**
     * inserts a new recipeIngredient and returns the created recipeIngredient
     * @param recipeIngredient recipeIngredient to insert
     */
    public async insertRecipeIngredient(recipeIngredient: RecipeIngredient): Promise<RecipeIngredient> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(recipeIngredient);
        const result = await this.insert(attributes);

        if (result.length > 0) {
            recipeIngredient.id = result[0].insertedId;
        }

        return recipeIngredient;
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): RecipeIngredient {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const recipeIngredient: RecipeIngredient = new RecipeIngredient();

        this.fillDefaultAttributes(result, recipeIngredient);

        if (result[this.name("recipe_id")]) {
            recipeIngredient.recipeId = result[this.name("recipe_id")];
        }

        if (result[this.name("ingredient_id")]) {
            recipeIngredient.ingredientId = result[this.name("ingredient_id")];
        }

        return recipeIngredient;
    }

    /**
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
     * @param recipeIngredient entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, recipeIngredient: RecipeIngredient): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const recipeIdAttribute: SQLValueAttribute = new SQLValueAttribute("recipe_id", prefix, recipeIngredient.recipeId);
        attributes.addAttribute(recipeIdAttribute);

        const ingredientIdAttribute: SQLValueAttribute = new SQLValueAttribute("ingredient_id", prefix, recipeIngredient.ingredientId);
        attributes.addAttribute(ingredientIdAttribute);

        return attributes;
    }

}
