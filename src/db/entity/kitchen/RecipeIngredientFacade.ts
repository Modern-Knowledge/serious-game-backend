
import { RecipeIngredient } from "serious-game-library/dist/models/RecipeIngredient";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * Handles CRUD operations with the recipes-ingredients-entity.
 */
export class RecipeIngredientFacade extends EntityFacade<RecipeIngredient> {

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("recipes_ingredients", tableAlias);
        } else {
            super("recipes_ingredients", "recing");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
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
     * Inserts a new recipe-ingredient and returns the created recipe-ingredient.
     *
     * @param recipeIngredient recipe-ingredient to insert
     */
    public async insert(recipeIngredient: RecipeIngredient): Promise<RecipeIngredient> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(recipeIngredient);
        const result = await this.insertStatement(attributes);

        if (result.length > 0) {
            recipeIngredient.id = result[0].insertedId;
        }

        return recipeIngredient;
    }

    /**
     * Fills the recipe-ingredient-entity from the result.
     *
     * @param result database results
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
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param recipeIngredient entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, recipeIngredient: RecipeIngredient): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const recipeIdAttribute: SQLValueAttribute
            = new SQLValueAttribute("recipe_id", prefix, recipeIngredient.recipeId);
        attributes.addAttribute(recipeIdAttribute);

        const ingredientIdAttribute: SQLValueAttribute
            = new SQLValueAttribute("ingredient_id", prefix, recipeIngredient.ingredientId);
        attributes.addAttribute(ingredientIdAttribute);

        return attributes;
    }

}
