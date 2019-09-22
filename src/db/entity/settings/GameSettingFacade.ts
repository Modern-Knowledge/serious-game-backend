import { SQLAttributes } from "../../sql/SQLAttributes";
import { GameSetting } from "../../../lib/models/GameSetting";
import { SQLJoin } from "../../sql/SQLJoin";
import { SQLBlock } from "../../sql/SQLBlock";
import { JoinType } from "../../sql/enums/JoinType";
import { DifficultyFacade } from "../enum/DifficultyFacade";
import { JoinCardinality } from "../../sql/enums/JoinCardinality";
import { CompositeFacade } from "../../composite/CompositeFacade";
import { Filter } from "../../filter/Filter";

/**
 * handles CRUD operations with game-settings-entity
 * contained Facades:
 * - DifficultyFacade
 *
 * contained Joins:
 *  - difficulties (1:1)
 */
export class GameSettingFacade extends CompositeFacade<GameSetting> {

    private _difficultyFacade: DifficultyFacade;

    private _withDifficultyJoin: boolean;

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("game_settings", tableAlias);
        } else {
            super("game_settings", "gs");
        }

        this._difficultyFacade = new DifficultyFacade();
        this._withDifficultyJoin = true;
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["game_id", "difficulty_id"];

        const returnAttributes: SQLAttributes = new SQLAttributes();
        returnAttributes.addSqlAttributes(super.getSQLAttributes(excludedSQLAttributes, sqlAttributes));

        if (this._withDifficultyJoin) {
            returnAttributes.addSqlAttributes(this._difficultyFacade.getSQLAttributes(excludedSQLAttributes));
        }

        return returnAttributes;
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): GameSetting {
        const gameSetting: GameSetting = new GameSetting();

        this.fillDefaultAttributes(result, gameSetting);

        if (result[this.name("game_id")] !== undefined) {
            gameSetting.gameId = result[this.name("game_id")];
        }

        if (result[this.name("difficulty_id")] !== undefined) {
            gameSetting.difficultyId = result[this.name("difficulty_id")];
        }

        if (this._withDifficultyJoin) {
            gameSetting.difficulty = this._difficultyFacade.fillEntity(result);
        }

        return gameSetting;
    }

    /**
     * creates the joins for the game-settings facade and returns them as a list
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
          this.difficultyFacadeFilter
        ];
    }

    /**
     * returns the difficultyFacadeFilter
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
