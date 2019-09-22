/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { CompositeFacade } from "./CompositeFacade";
import { Recipe } from "../../lib/models/Recipe";
import { RecipeFacade } from "../entity/kitchen/RecipeFacade";
import { RecipeIngredientFacade } from "../entity/kitchen/RecipeIngredientFacade";
import { IngredientFacade } from "../entity/kitchen/IngredientFacade";
import { SQLAttributes } from "../sql/SQLAttributes";
import { Ingredient } from "../../lib/models/Ingredient";
import { SQLJoin } from "../sql/SQLJoin";
import { SQLBlock } from "../sql/SQLBlock";
import { JoinType } from "../sql/enums/JoinType";
import { JoinCardinality } from "../sql/enums/JoinCardinality";
import { Helper } from "../../util/Helper";
import { Filter } from "../filter/Filter";

/**
 * retrieves composite recipes
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
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("recipes", tableAlias);
        } else {
            super("recipes", "r");
        }

        this._recipeFacade = new RecipeFacade();
        this._recipeIngredientFacade = new RecipeIngredientFacade();
        this._ingredientFacade = new IngredientFacade();

        this._withIngredientsJoin = true;
        this._withDifficultyJoin = true;
        this._withFoodCategoryJoin = true;
    }

    /**
     * returns sql attributes that should be retrieved from the database
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
     * fills the entity
     * @param result result for filling
     */
    protected fillEntity(result: any): Recipe {
        const r: Recipe = this._recipeFacade.fillEntity(result);

        if (this._withIngredientsJoin) {
            const ing: Ingredient = this._ingredientFacade.fillEntity(result);
            r.ingredients.push(ing);
        }

        return r;
    }

    /**
     * creates the joins for the composite games facade and returns them as a list
     */
    get joins(): SQLJoin[] {
        let joins: SQLJoin[] = [];

        joins = joins.concat(this._recipeFacade.joins); // add recipe joins (difficulties)

        if (this._withIngredientsJoin) {
            const recipesIngredientsJoin: SQLBlock = new SQLBlock();
            recipesIngredientsJoin.addText(`${this._recipeIngredientFacade.tableAlias}.recipe_id = ${this.tableAlias}.id`);
            joins.push(new SQLJoin(this._recipeIngredientFacade.tableName, this._recipeIngredientFacade.tableAlias, recipesIngredientsJoin, JoinType.JOIN, JoinCardinality.ONE_TO_MANY));

            const ingredientsJoin: SQLBlock = new SQLBlock();
            ingredientsJoin.addText(`${this._ingredientFacade.tableAlias}.id = ${this._recipeIngredientFacade.tableAlias}.ingredient_id`);
            joins.push(new SQLJoin(this._ingredientFacade.tableName, this._ingredientFacade.tableAlias, ingredientsJoin, JoinType.JOIN, JoinCardinality.ONE_TO_ONE));

            joins = joins.concat(this._ingredientFacade.joins); // add ingredient joins (food_categories)
        }

        return joins;
    }

    /**
     * post process the results of the select query
     * e.g.: handle joins
     * @param entities entities that where returned from the database
     */
    protected postProcessSelect(entities: Recipe[]): Recipe[] {
        const recipeMap = new Map<number, Recipe>();

        for (const recipe of entities) {
            if (!recipeMap.has(recipe.id)) {
                recipeMap.set(recipe.id, recipe);
            } else {
                const existingRecipe: Recipe = recipeMap.get(recipe.id);

                if (!Helper.arrayContainsModel(recipe.ingredients[0], existingRecipe.ingredients)) {
                    existingRecipe.ingredients = existingRecipe.ingredients.concat(recipe.ingredients);
                }
            }
        }

        return Array.from(recipeMap.values());
    }

    /**
     * returns all sub facade filters of the facade as an array
     */
    protected get filters(): Filter[] {
        return [
            this.ingredientFilter,
            this.difficultyFilter,
        ];
    }

    /**
     * returns the difficulty facade filter
     */
    get difficultyFilter(): Filter {
        return this._recipeFacade.difficultyFacadeFilter;
    }

    /**
     * returns the ingredient facade filter
     */
    get ingredientFilter(): Filter {
        return this._ingredientFacade.filter;
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