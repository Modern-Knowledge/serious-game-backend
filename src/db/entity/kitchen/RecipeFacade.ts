import { Recipe } from "../../../lib/models/Recipe";
import { CompositeFacade } from "../../composite/CompositeFacade";
import { Filter } from "../../filter/Filter";
import { Ordering } from "../../order/Ordering";
import { JoinCardinality } from "../../sql/enums/JoinCardinality";
import { JoinType } from "../../sql/enums/JoinType";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLBlock } from "../../sql/SQLBlock";
import { SQLJoin } from "../../sql/SQLJoin";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { DifficultyFacade } from "../enum/DifficultyFacade";

/**
 * Handles CRUD operations with the recipe-entity.
 *
 * contained Facades:
 * - DifficultyFacade
 *
 * contained Joins:
 * - difficulties (1:1)
 */
export class RecipeFacade extends CompositeFacade<Recipe> {
    private _difficultyFacade: DifficultyFacade;

    private _withDifficultyJoin: boolean;

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("recipes", tableAlias);
        } else {
            super("recipes", "rec");
        }

        this._difficultyFacade = new DifficultyFacade();

        this._withDifficultyJoin = true;
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = [
            "name",
            "description",
            "difficulty_id",
            "mealtime"
        ];

        const recipeAttributes: SQLAttributes = super.getSQLAttributes(
            excludedSQLAttributes,
            sqlAttributes
        );

        if (this._withDifficultyJoin) {
            const difficultyAttributes: SQLAttributes = this._difficultyFacade.getSQLAttributes(
                excludedSQLAttributes
            );
            recipeAttributes.addSqlAttributes(difficultyAttributes);
        }

        return recipeAttributes;
    }

    /**
     * Inserts a new recipe and returns the created recipe.
     *
     * @param recipe recipe to insert
     */
    public async insert(recipe: Recipe): Promise<Recipe> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(
            recipe
        );
        const result = await this.insertStatement(attributes);

        if (result.length > 0) {
            recipe.id = result[0].insertedId;
        }

        return recipe;
    }

    /**
     * Fills the recipe-entity from the result.
     *
     * @param result database results
     */
    public fillEntity(result: any): Recipe {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const recipe: Recipe = new Recipe();

        this.fillDefaultAttributes(result, recipe);

        if (result[this.name("name")]) {
            recipe.name = result[this.name("name")];
        }

        if (result[this.name("description")]) {
            recipe.description = result[this.name("description")];
        }

        if (result[this.name("difficulty_id")]) {
            recipe.difficultyId = result[this.name("difficulty_id")];
        }

        if (result[this.name("mealtime")]) {
            recipe.mealtime = result[this.name("mealtime")];
        }

        if (this._withDifficultyJoin) {
            const difficulty = this._difficultyFacade.fillEntity(result);
            if (difficulty) {
                recipe.difficulty = this._difficultyFacade.fillEntity(result);
            }
        }

        return recipe;
    }

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param recipe entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, recipe: Recipe): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const nameAttribute: SQLValueAttribute = new SQLValueAttribute(
            "name",
            prefix,
            recipe.name
        );
        attributes.addAttribute(nameAttribute);

        const descriptionAttribute: SQLValueAttribute = new SQLValueAttribute(
            "description",
            prefix,
            recipe.description
        );
        attributes.addAttribute(descriptionAttribute);

        const difficultyIdAttribute: SQLValueAttribute = new SQLValueAttribute(
            "difficulty_id",
            prefix,
            recipe.difficultyId
        );
        attributes.addAttribute(difficultyIdAttribute);

        const mealtimeAttribute: SQLValueAttribute = new SQLValueAttribute(
            "mealtime",
            prefix,
            recipe.mealtime
        );
        attributes.addAttribute(mealtimeAttribute);

        return attributes;
    }

    /**
     * Creates the joins for the recipe-facade and returns them as a list.
     */
    get joins(): SQLJoin[] {
        const joins: SQLJoin[] = [];

        if (this._withDifficultyJoin) {
            const difficultyJoin: SQLBlock = new SQLBlock();
            difficultyJoin.addText(
                `${this.tableAlias}.difficulty_id = ${this._difficultyFacade.tableAlias}.id`
            );
            joins.push(
                new SQLJoin(
                    this._difficultyFacade.tableName,
                    this._difficultyFacade.tableAlias,
                    difficultyJoin,
                    JoinType.JOIN,
                    JoinCardinality.ONE_TO_ONE
                )
            );
        }

        return joins;
    }

    /**
     * Returns all sub facade filters of the facade as an array.
     */
    protected get filters(): Filter[] {
        return [this.difficultyFacadeFilter];
    }

    get difficultyFacadeFilter(): Filter {
        return this._difficultyFacade.filter;
    }

    /**
     * Returns all sub facade order-bys of the facade as an array.
     */
    protected get orderBys(): Ordering[] {
        return [this.difficultyFacadeOrderBy];
    }

    get difficultyFacadeOrderBy(): Ordering {
        return this._difficultyFacade.ordering;
    }

    get withDifficultyJoin(): boolean {
        return this._withDifficultyJoin;
    }

    set withDifficultyJoin(value: boolean) {
        this._withDifficultyJoin = value;
    }
}
