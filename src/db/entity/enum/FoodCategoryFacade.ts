/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { FoodCategory } from "../../../lib/models/FoodCategory";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";

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
     * inserts a new food-category and returns the created food-category
     * @param foodCategory
     */
    public async insertFoodCategory(foodCategory: FoodCategory): Promise<FoodCategory> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(foodCategory);
        const result = await this.insert(attributes);

        if (result.length > 0) {
            foodCategory.id = result[0].insertedId;
        }

        return foodCategory;
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): FoodCategory {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const foodCategory: FoodCategory = new FoodCategory();

        this.fillDefaultAttributes(result, foodCategory);

        if (result[this.name("name")]) {
            foodCategory.name = result[this.name("name")];
        }

        return foodCategory;
    }

    /**
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
     * @param foodCategory entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, foodCategory: FoodCategory): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const nameAttribute: SQLValueAttribute = new SQLValueAttribute("name", prefix, foodCategory.name);
        attributes.addAttribute(nameAttribute);

        return attributes;
    }

}
