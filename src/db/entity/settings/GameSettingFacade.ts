
import { GameSetting } from "../../../lib/models/GameSetting";
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
     * @param tableAlias table-alias of the facade
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
     * inserts a new gameSetting and returns the created gameSetting
     * @param gameSetting gameSetting to insert
     */
    public async insertGameSetting(gameSetting: GameSetting): Promise<GameSetting> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(gameSetting);
        const result = await this.insert(attributes);

        if (result.length > 0) {
            gameSetting.id = result[0].insertedId;
        }

        return gameSetting;
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): GameSetting {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const gameSetting: GameSetting = new GameSetting();

        this.fillDefaultAttributes(result, gameSetting);

        if (result[this.name("game_id")]) {
            gameSetting.gameId = result[this.name("game_id")];
        }

        if (result[this.name("difficulty_id")]) {
            gameSetting.difficultyId = result[this.name("difficulty_id")];
        }

        if (this._withDifficultyJoin) {
            const difficulty = this._difficultyFacade.fillEntity(result);
            if (difficulty) {
                gameSetting.difficulty = this._difficultyFacade.fillEntity(result);
            }
        }

        return gameSetting;
    }

    /**
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
     * @param gameSetting entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, gameSetting: GameSetting): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const gameIdAttribute: SQLValueAttribute = new SQLValueAttribute("game_id", prefix, gameSetting.gameId);
        attributes.addAttribute(gameIdAttribute);

        const difficultyId: SQLValueAttribute
            = new SQLValueAttribute("difficulty_id", prefix, gameSetting.difficultyId);
        attributes.addAttribute(difficultyId);

        return attributes;
    }

    /**
     * creates the joins for the game-settings facade and returns them as a list
     */
    get joins(): SQLJoin[] {
        const joins: SQLJoin[] = [];

        if (this._withDifficultyJoin) {
            const difficultyJoin: SQLBlock = new SQLBlock();
            difficultyJoin.addText(`${this.tableAlias}.difficulty_id = ${this._difficultyFacade.tableAlias}.id`);
            joins.push(
                new SQLJoin(this._difficultyFacade.tableName, this._difficultyFacade.tableAlias, difficultyJoin,
                    JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE)
            );
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

    /**
     * returns all sub facade order-bys of the facade as an array
     */
    protected get orderBys(): Ordering[] {
        return [
            this.difficultyFacadeOrderBy
        ];
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
