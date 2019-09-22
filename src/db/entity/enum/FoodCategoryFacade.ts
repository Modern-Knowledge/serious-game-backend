/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { FoodCategory } from "../../../lib/models/FoodCategory";

/**
 * handles CRUD operations with the food-category-entity
 */
export class FoodCategoryFacade extends EntityFacade<FoodCategory> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("food_categories", tableAlias);
        } else {
            super("food_categories", "foc");
        }
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["name"];

        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): FoodCategory {
        const foodCategory: FoodCategory = new FoodCategory();

        this.fillDefaultAttributes(result, foodCategory);

        if (result[this.name("name")] !== undefined) {
            foodCategory.name = result[this.name("name")];
        }

        return foodCategory;
    }

}
