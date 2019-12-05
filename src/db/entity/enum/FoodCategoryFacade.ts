
import { FoodCategory } from "../../../lib/models/FoodCategory";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * handles CRUD operations with the food-category-entity
 */
export class FoodCategoryFacade extends EntityFacade<FoodCategory> {

    /**
     * @param tableAlias table-alias of the facade
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
     * @param foodCategory food-category to insert
     */
    public async insert(foodCategory: FoodCategory): Promise<FoodCategory> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(foodCategory);
        const result = await this.insertStatement(attributes);

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
