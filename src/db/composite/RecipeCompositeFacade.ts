
import { Ingredient } from "../../lib/models/Ingredient";
import { Recipe } from "../../lib/models/Recipe";
import { arrayContainsModel } from "../../util/Helper";
import { IngredientFacade } from "../entity/kitchen/IngredientFacade";
import { RecipeFacade } from "../entity/kitchen/RecipeFacade";
import { RecipeIngredientFacade } from "../entity/kitchen/RecipeIngredientFacade";
import { Filter } from "../filter/Filter";
import { Ordering } from "../order/Ordering";
import { JoinCardinality } from "../sql/enums/JoinCardinality";
import { JoinType } from "../sql/enums/JoinType";
import { SQLAttributes } from "../sql/SQLAttributes";
import { SQLBlock } from "../sql/SQLBlock";
import { SQLJoin } from "../sql/SQLJoin";
import { CompositeFacade } from "./CompositeFacade";

/**
 * Retrieves recipes with ingredients.
 *
 * contained Facades:
 * - RecipeFacade
 * - RecipeIngredientFacade
 * - IngredientFacade
 *
 * contained Joins:
 * - difficulties (1:1)
 * - recipes_ingredients (1:n)
 * - ingredients (1:1)
 *   - food categories (1:1)
 */
export class RecipeCompositeFacade extends CompositeFacade<Recipe> {

    private _recipeFacade: RecipeFacade;
    private _recipeIngredientFacade: RecipeIngredientFacade;
    private _ingredientFacade: IngredientFacade;

    private _withIngredientsJoin: boolean;
    private _withDifficultyJoin: boolean;
    private _withFoodCategoryJoin: boolean;

    /**
     * @param tableAlias table-alias of the composite facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("recipes", tableAlias);
        } else {
            super("recipes", "rec");
        }

        this._recipeFacade = new RecipeFacade();
        this._recipeIngredientFacade = new RecipeIngredientFacade();
        this._ingredientFacade = new IngredientFacade();

        this._withIngredientsJoin = true;
        this._withDifficultyJoin = true;
        this._withFoodCategoryJoin = true;
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const returnAttributes: SQLAttributes = new SQLAttributes();

        returnAttributes.addSqlAttributes(this._recipeFacade.getSQLAttributes(excludedSQLAttributes));

        if (this._withIngredientsJoin) {
            returnAttributes.addSqlAttributes(this._recipeIngredientFacade.getSQLAttributes(excludedSQLAttributes));
            returnAttributes.addSqlAttributes(this._ingredientFacade.getSQLAttributes(excludedSQLAttributes));
        }

        return returnAttributes;
    }

    /**
     * Fills the recipe-entity from the result. Joined entities are added to
     * the recipe.
     *
     * @param result database-results
     */
    protected fillEntity(result: any): Recipe {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const r: Recipe = this._recipeFacade.fillEntity(result);

        if (this._withIngredientsJoin) {
            const ing: Ingredient = this._ingredientFacade.fillEntity(result);
            if (ing) {
                r.ingredients.push(ing);
            }
        }

        return r;
    }

    /**
     * Creates the joins for the recipe-facade and returns them as a list.
     */
    get joins(): SQLJoin[] {
        let joins: SQLJoin[] = [];

        joins = joins.concat(this._recipeFacade.joins); // add recipe joins (difficulties)

        if (this._withIngredientsJoin) {
            const recipesIngredientsJoin: SQLBlock = new SQLBlock();
            recipesIngredientsJoin.addText(
                `${this._recipeIngredientFacade.tableAlias}.recipe_id = ${this.tableAlias}.id`
            );
            joins.push(new SQLJoin(
                this._recipeIngredientFacade.tableName, this._recipeIngredientFacade.tableAlias, recipesIngredientsJoin,
                JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_MANY)
            );

            const ingredientsJoin: SQLBlock = new SQLBlock();
            ingredientsJoin.addText(
                `${this._ingredientFacade.tableAlias}.id = ${this._recipeIngredientFacade.tableAlias}.ingredient_id`
            );
            joins.push(new SQLJoin(
                this._ingredientFacade.tableName, this._ingredientFacade.tableAlias, ingredientsJoin,
                JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE)
            );

            joins = joins.concat(this._ingredientFacade.joins); // add ingredient joins (food_categories)
        }

        return joins;
    }

    /**
     * Post process the results of the select-query.
     * e.g.: Handle joined result set.
     *
     * @param entities entities that where returned from the database
     */
    protected postProcessSelect(entities: Recipe[]): Recipe[] {
        const recipeMap = new Map<number, Recipe>();

        for (const recipe of entities) {
            if (!recipeMap.has(recipe.id)) {
                recipeMap.set(recipe.id, recipe);
            } else {
                const existingRecipe: Recipe = recipeMap.get(recipe.id);

                if (!arrayContainsModel(recipe.ingredients[0], existingRecipe.ingredients)) {
                    existingRecipe.ingredients = existingRecipe.ingredients.concat(recipe.ingredients);
                }
            }
        }

        return Array.from(recipeMap.values());
    }

    /**
     * Returns all sub-facade filters of the facade as an array.
     */
    protected get filters(): Filter[] {
        return [
            this.ingredientFilter,
            this.difficultyFilter,
            this.foodCategoryFilter
        ];
    }

    get difficultyFilter(): Filter {
        return this._recipeFacade.difficultyFacadeFilter;
    }

    get ingredientFilter(): Filter {
        return this._ingredientFacade.filter;
    }

    get foodCategoryFilter(): Filter {
        return this._ingredientFacade.foodCategoryFacadeFilter;
    }

    /**
     * Returns all sub-facade order-bys of the facade as an array.
     */
    protected get orderBys(): Ordering[] {
        return [
            this.difficultyOrderBy,
            this.ingredientOrderBy,
            this.foodCategoryOrderBy,
        ];
    }

    get difficultyOrderBy(): Ordering {
        return this._recipeFacade.difficultyFacadeOrderBy;
    }

    get ingredientOrderBy(): Ordering {
        return this._ingredientFacade.ordering;
    }

    get foodCategoryOrderBy(): Ordering {
        return this._ingredientFacade.foodCategoryFacadeOrderBy;
    }

    get withIngredientsJoin(): boolean {
        return this._withIngredientsJoin;
    }

    set withIngredientsJoin(value: boolean) {
        this._withIngredientsJoin = value;
    }

    get withDifficultyJoin(): boolean {
        return this._withDifficultyJoin;
    }

    set withDifficultyJoin(value: boolean) {
        this._recipeFacade.withDifficultyJoin = value;
        this._withDifficultyJoin = value;
    }

    get withFoodCategoryJoin(): boolean {
        return this._withFoodCategoryJoin;
    }

    set withFoodCategoryJoin(value: boolean) {
        this._ingredientFacade.withFoodCategoryJoin = value;
        this._withFoodCategoryJoin = value;
    }
}
