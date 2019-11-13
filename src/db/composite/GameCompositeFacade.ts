import { Errortext } from "../../lib/models/Errortext";
import { Game } from "../../lib/models/Game";
import { GameSetting } from "../../lib/models/GameSetting";
import { Helptext } from "../../lib/models/Helptext";
import { arrayContainsModel } from "../../util/Helper";
import { GameFacade } from "../entity/game/GameFacade";
import { ErrortextFacade } from "../entity/helptext/ErrortextFacade";
import { ErrortextGamesFacade } from "../entity/helptext/ErrortextGamesFacade";
import { HelptextFacade } from "../entity/helptext/HelptextFacade";
import { HelptextsGamesFacade } from "../entity/helptext/HelptextsGamesFacade";
import { GameSettingFacade } from "../entity/settings/GameSettingFacade";
import { Filter } from "../filter/Filter";
import { Ordering } from "../order/Ordering";
import { JoinCardinality } from "../sql/enums/JoinCardinality";
import { JoinType } from "../sql/enums/JoinType";
import { SQLAttributes } from "../sql/SQLAttributes";
import { SQLBlock } from "../sql/SQLBlock";
import { SQLJoin } from "../sql/SQLJoin";
import { CompositeFacade } from "./CompositeFacade";

/**
 * retrieves composite games
 * contained Facades:
 * - GameFacade
 * - GameSettingFacade
 * - HelptextGamesFacade
 * - HelptextFacade
 *
 * contained Joins:
 * - game_settings (1:n)
 *  - difficulty (1:1)
 * - helptexts_games (1:n)
 * - helptexts (1:n)
 *  - texts (1:1)
 * - errortexts_games (1:n)
 * - errortexts (1:n)
 *  - texts (1:1)
 */
export class GameCompositeFacade extends CompositeFacade<Game> {

    private _gameFacade: GameFacade;
    private _gameSettingsFacade: GameSettingFacade;
    private _helptextsGamesFacade: HelptextsGamesFacade;
    private _helptextFacade: HelptextFacade;
    private _errortextGamesFacade: ErrortextGamesFacade;
    private _errortextFacade: ErrortextFacade;

    private _withGameSettingsJoin: boolean;
    private _withDifficultyJoin: boolean;
    private _withHelptextJoin: boolean;
    private _withHelptextTextJoin: boolean;
    private _withErrortextJoin: boolean;
    private _withErrortextTextJoin: boolean;

    /**
     * @param tableAlias table-alias of the composite-facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("games", tableAlias);
        } else {
            super("games", "g");
        }

        this._gameFacade = new GameFacade();
        this._gameSettingsFacade = new GameSettingFacade();
        this._helptextsGamesFacade = new HelptextsGamesFacade();
        this._helptextFacade = new HelptextFacade();
        this._errortextGamesFacade = new ErrortextGamesFacade();
        this._errortextFacade = new ErrortextFacade();

        this._withGameSettingsJoin = true;
        this._withDifficultyJoin = true;
        this._withHelptextJoin = true;
        this._withHelptextTextJoin = true;
        this._withErrortextJoin = true;
        this._withErrortextTextJoin = true;
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const returnAttributes: SQLAttributes = new SQLAttributes();

        returnAttributes.addSqlAttributes(this._gameFacade.getSQLAttributes(excludedSQLAttributes));

        if (this._withGameSettingsJoin) {
            returnAttributes.addSqlAttributes(this._gameSettingsFacade.getSQLAttributes(excludedSQLAttributes));
        }
        if (this._withHelptextJoin) {
            returnAttributes.addSqlAttributes(this._helptextsGamesFacade.getSQLAttributes(excludedSQLAttributes));
            returnAttributes.addSqlAttributes(this._helptextFacade.getSQLAttributes(excludedSQLAttributes));
        }
        if (this._withErrortextJoin) {
            returnAttributes.addSqlAttributes(this._errortextGamesFacade.getSQLAttributes(excludedSQLAttributes));
            returnAttributes.addSqlAttributes(this._errortextFacade.getSQLAttributes(excludedSQLAttributes));
        }

        return returnAttributes;
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    protected fillEntity(result: any): Game {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const g: Game = this._gameFacade.fillEntity(result);

        if (this._withGameSettingsJoin) {
            const gs: GameSetting = this._gameSettingsFacade.fillEntity(result);
            if (gs) {
                g.gameSettings.push(gs);
            }
        }

        if (this._withHelptextJoin) {
            const ht: Helptext = this._helptextFacade.fillEntity(result);
            if (ht) {
                g.helptexts.push(ht);
            }
        }

        if (this._withErrortextJoin) {
            const et: Errortext = this._errortextFacade.fillEntity(result);
            if (et) {
                g.errortexts.push(et);
            }
        }

        return g;
    }

    /**
     * creates the joins for the composite games facade and returns them as a list
     */
    get joins(): SQLJoin[] {
        let joins: SQLJoin[] = [];

        if (this._withGameSettingsJoin) {
            const gameSettingJoin: SQLBlock = new SQLBlock();
            gameSettingJoin.addText(`${this._gameSettingsFacade.tableAlias}.game_id = ${this.tableAlias}.id`);
            joins.push(
                new SQLJoin(this._gameSettingsFacade.tableName, this._gameSettingsFacade.tableAlias,
                    gameSettingJoin, JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_MANY)
            );

            joins = joins.concat(this._gameSettingsFacade.joins); // add game-settings joins (difficulty)
        }

        if (this._withHelptextJoin) {
            const helptextGamesJoin: SQLBlock = new SQLBlock();
            helptextGamesJoin.addText(`${this._helptextsGamesFacade.tableAlias}.game_id = ${this.tableAlias}.id`);
            joins.push(
                new SQLJoin(this._helptextsGamesFacade.tableName, this._helptextsGamesFacade.tableAlias,
                    helptextGamesJoin, JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_MANY)
            );

            const helptextsJoin: SQLBlock = new SQLBlock();
            helptextsJoin.addText(
                `${this._helptextFacade.tableAlias}.helptext_id = ${this._helptextsGamesFacade.tableAlias}.helptext_id`
            );
            joins.push(
                new SQLJoin(this._helptextFacade.tableName, this._helptextFacade.tableAlias,
                    helptextsJoin, JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE));

            joins = joins.concat(this._helptextFacade.joins); // add helptext joins (text)
        }

        if (this._withErrortextJoin) {
            const errortextGameJoin: SQLBlock = new SQLBlock();
            errortextGameJoin.addText(`${this._errortextGamesFacade.tableAlias}.game_id = ${this.tableAlias}.id`);
            joins.push(
                new SQLJoin(this._errortextGamesFacade.tableName, this._errortextGamesFacade.tableAlias,
                    errortextGameJoin, JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_MANY)
            );

            const errortextsJoin: SQLBlock = new SQLBlock();
            errortextsJoin.addText(
                `${this._errortextFacade.tableAlias}.error_id = ${this._errortextGamesFacade.tableAlias}.error_id`
            );
            joins.push(
                new SQLJoin(this._errortextFacade.tableName, this._errortextFacade.tableAlias,
                    errortextsJoin, JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE)
            );

            joins = joins.concat(this._errortextFacade.joins); // add helptext joins (text)
        }

        return joins;
    }

    /**
     * post process the results of the select query
     * e.g.: handle joins
     * @param entities entities that where returned from the database
     */
    protected postProcessSelect(entities: Game[]): Game[] {
        const gameMap = new Map<number, Game>();

        for (const game of entities) {
            if (!gameMap.has(game.id)) {
                gameMap.set(game.id, game);
            } else {
                const existingGame: Game = gameMap.get(game.id);

                if (!arrayContainsModel(game.helptexts[0], existingGame.helptexts)) {
                    existingGame.helptexts = existingGame.helptexts.concat(game.helptexts);
                }

                if (!arrayContainsModel(game.errortexts[0], existingGame.errortexts)) {
                    existingGame.errortexts = existingGame.errortexts.concat(game.errortexts);
                }

                if (!arrayContainsModel(game.gameSettings[0], existingGame.gameSettings)) {
                    existingGame.gameSettings = existingGame.gameSettings.concat(game.gameSettings);
                }
            }
        }

        return Array.from(gameMap.values());
    }

    /**
     * returns all sub facade filters of the facade as an array
     */
    protected get filters(): Filter[] {
        return [
            this.gameSettingFacadeFilter,
            this.helptextFacadeFilter,
            this.helptextTextFacadeFilter,
            this.errortextFacadeFilter,
            this.errortextTextFacadeFilter,
            this.difficultyFacadeFilter
        ];
    }

    get difficultyFacadeFilter(): Filter {
        return this._gameSettingsFacade.difficultyFacadeFilter;
    }

    get gameSettingFacadeFilter(): Filter {
        return this._gameSettingsFacade.filter;
    }

    get helptextFacadeFilter(): Filter {
        return this._helptextFacade.filter;
    }

    get helptextTextFacadeFilter(): Filter {
        return this._helptextFacade.textFacadeFilter;
    }

    get errortextFacadeFilter(): Filter {
        return this._errortextFacade.filter;
    }

    get errortextTextFacadeFilter(): Filter {
        return this._errortextFacade.textFacadeFilter;
    }

    /**
     * returns all sub facade order-bys of the facade as an array
     */
    protected get orderBys(): Ordering[] {
        return [
            this.difficultyFacadeOrderBy,
            this.gameSettingFacadeOrderBy,
            this.helptextFacadeOrderBy,
            this.helptextTextFacadeOrderBy,
            this.errortextFacadeOrderBy,
            this.errortextTextFacadeOrderBy
        ];
    }

    get difficultyFacadeOrderBy(): Ordering {
        return this._gameSettingsFacade.difficultyFacadeOrderBy;
    }

    get gameSettingFacadeOrderBy(): Ordering {
        return this._gameSettingsFacade.ordering;
    }

    get helptextFacadeOrderBy(): Ordering {
        return this._helptextFacade.ordering;
    }

    get helptextTextFacadeOrderBy(): Ordering {
        return this._helptextFacade.textFacadeOrderBy;
    }

    get errortextFacadeOrderBy(): Ordering {
        return this._errortextFacade.ordering;
    }

    get errortextTextFacadeOrderBy(): Ordering {
        return this._errortextFacade.textFacadeOrderBy;
    }

    get withHelptextTextJoin(): boolean {
        return this._withHelptextTextJoin;
    }

    set withHelptextTextJoin(value: boolean) {
        this._helptextFacade.withTextJoin = value;
        this._withHelptextTextJoin = value;
    }

    get withErrortextTextJoin(): boolean {
        return this._withErrortextTextJoin;
    }

    set withErrortextTextJoin(value: boolean) {
        this._errortextFacade.withTextJoin = value;
        this._withErrortextTextJoin = value;
    }

    get withGameSettingsJoin(): boolean {
        return this._withGameSettingsJoin;
    }

    set withGameSettingsJoin(value: boolean) {
        this._withGameSettingsJoin = value;
    }

    get withDifficultyJoin(): boolean {
        return this._withDifficultyJoin;
    }

    set withDifficultyJoin(value: boolean) {
        this._gameSettingsFacade.withDifficultyJoin = value;
        this._withDifficultyJoin = value;
    }

    get withHelptextJoin(): boolean {
        return this._withHelptextJoin;
    }

    set withHelptextJoin(value: boolean) {
        this._withHelptextJoin = value;
    }

    get withErrortextJoin(): boolean {
        return this._withErrortextJoin;
    }

    set withErrortextJoin(value: boolean) {
        this._withErrortextJoin = value;
    }
}
