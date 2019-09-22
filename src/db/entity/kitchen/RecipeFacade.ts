/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { SQLAttributes } from "../../sql/SQLAttributes";
import { Recipe } from "../../../lib/models/Recipe";
import { DifficultyFacade } from "../enum/DifficultyFacade";
import { SQLJoin } from "../../sql/SQLJoin";
import { SQLBlock } from "../../sql/SQLBlock";
import { JoinType } from "../../sql/enums/JoinType";
import { JoinCardinality } from "../../sql/enums/JoinCardinality";
import { Filter } from "../../filter/Filter";
import { CompositeFacade } from "../../composite/CompositeFacade";

/**
 * handles CRUD operations with the recipe-entity
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
     * @param tableAlias
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
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] =  ["name", "description", "difficulty_id"];

        const recipeAttributes: SQLAttributes = super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);

        if (this._withDifficultyJoin) {
           const difficultyAttributes: SQLAttributes = this._difficultyFacade.getSQLAttributes(excludedSQLAttributes);
           recipeAttributes.addSqlAttributes(difficultyAttributes);
        }

        return recipeAttributes;
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Recipe {
        const recipe: Recipe = new Recipe();

        this.fillDefaultAttributes(result, recipe);

        if (result[this.name("name")] !== undefined) {
            recipe.name = result[this.name("name")];
        }

        if (result[this.name("description")] !== undefined) {
            recipe.description = result[this.name("description")];
        }

        if (result[this.name("difficulty_id")] !== undefined) {
            recipe.difficultyId = result[this.name("difficulty_id")];
        }

        if (this._withDifficultyJoin) {
            recipe.difficulty = this._difficultyFacade.fillEntity(result);
        }

        return recipe;
    }

    /**
     * creates the joins for the recipe facade and returns them as a list
     */
    get joins(): SQLJoin[] {
        const joins: SQLJoin[] = [];

        if (this._withDifficultyJoin) {
            const difficultyJoin: SQLBlock = new SQLBlock();
            difficultyJoin.addText(`${this.tableAlias}.difficulty_id = ${this._difficultyFacade.tableAlias}.id`);
            joins.push(new SQLJoin(this._difficultyFacade.tableName, this._difficultyFacade.tableAlias, difficultyJoin, JoinType.JOIN, JoinCardinality.ONE_TO_ONE));
        }

        return joins;
    }

    /**
     * returns all sub facade filters of the facade as an array
     */
    protected get filters(): Filter[] {
        return [
            this.difficultyFacadeFilter,
        ];
    }

    /**
     * returns the difficulty facade filter
     */
    get difficultyFacadeFilter(): Filter {
        return this._difficultyFacade.filter;
    }

    get withDifficultyJoin(): boolean {
        return this._withDifficultyJoin;
    }

    set withDifficultyJoin(value: boolean) {
        this._withDifficultyJoin = value;
    }
}
