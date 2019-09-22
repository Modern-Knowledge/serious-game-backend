/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { Ingredient } from "../../../lib/models/Ingredient";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { FoodCategoryFacade } from "../enum/FoodCategoryFacade";
import { CompositeFacade } from "../../composite/CompositeFacade";
import { SQLJoin } from "../../sql/SQLJoin";
import { SQLBlock } from "../../sql/SQLBlock";
import { JoinType } from "../../sql/enums/JoinType";
import { JoinCardinality } from "../../sql/enums/JoinCardinality";
import { Filter } from "../../filter/Filter";
import { SQLOrderBy } from "../../sql/SQLOrderBy";

/**
 * handles CRUD operations with the ingredient-entity
 * contained Facades:
 * - FoodCategoryFacade
 *
 * contained Joins:
 * - food_categories (1:1)
 */
export class IngredientFacade extends CompositeFacade<Ingredient> {

    private _foodCategoryFacade: FoodCategoryFacade;

    private _withFoodCategoryJoin: boolean;

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("ingredients", tableAlias);
        } else {
            super("ingredients", "ig");
        }

        this._foodCategoryFacade = new FoodCategoryFacade();

        this._withFoodCategoryJoin = true;
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] =  ["name", "image_id", "food_category_id"];

        const ingredientAttributes: SQLAttributes = super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);

        if (this._withFoodCategoryJoin) {
            const foodCategoryAttributes: SQLAttributes = this._foodCategoryFacade.getSQLAttributes(excludedSQLAttributes);
            foodCategoryAttributes.addSqlAttributes(foodCategoryAttributes);
        }

        return ingredientAttributes;
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

        if (this._withFoodCategoryJoin) {
            ingredient.foodCategory = this._foodCategoryFacade.fillEntity(result);
        }

        return ingredient;
    }

    /**
     * creates the joins for the ingredient facade and returns them as a list
     */
    get joins(): SQLJoin[] {
        const joins: SQLJoin[] = [];

        if (this._withFoodCategoryJoin) {
            const foodCategoryFacade: SQLBlock = new SQLBlock();
            foodCategoryFacade.addText(`${this.tableAlias}.food_category_id = ${this._foodCategoryFacade.tableAlias}.id`);
            joins.push(new SQLJoin(this._foodCategoryFacade.tableName, this._foodCategoryFacade.tableAlias, foodCategoryFacade, JoinType.JOIN, JoinCardinality.ONE_TO_ONE));
        }

        return joins;
    }

    /**
     * returns all sub facade filters of the facade as an array
     */
    protected get filters(): Filter[] {
        return [
            this.foodCategoryFacadeFilter,
        ];
    }

    get foodCategoryFacadeFilter(): Filter {
        return this._foodCategoryFacade.filter;
    }

    /**
     * returns all sub facade order-bys of the facade as an array
     */
    protected get orderBys(): SQLOrderBy[][] {
        return [
            this.foodCategoryFacadeOrderBy
        ];
    }

    get foodCategoryFacadeOrderBy(): SQLOrderBy[] {
        return this._foodCategoryFacade.orderBy;
    }

    get withFoodCategoryJoin(): boolean {
        return this._withFoodCategoryJoin;
    }

    set withFoodCategoryJoin(value: boolean) {
        this._withFoodCategoryJoin = value;
    }
}
