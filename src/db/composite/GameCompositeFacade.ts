import { EntityFacade } from "../entity/EntityFacade";
import { SQLAttributes } from "../sql/SQLAttributes";
import { SQLJoin } from "../sql/SQLJoin";
import { SQLBlock } from "../sql/SQLBlock";
import { JoinType } from "../sql/JoinType";
import { Game } from "../../lib/models/Game";
import { GameSettingFacade } from "../entity/settings/GameSettingFacade";
import { GameFacade } from "../entity/game/GameFacade";
import { HelptextFacade } from "../entity/helptext/HelptextFacade";
import { HelptextsGamesFacade } from "../entity/helptext/HelptextsGamesFacade";
import { GameSetting } from "../../lib/models/GameSetting";
import { Helptext } from "../../lib/models/Helptext";
import { Helper } from "../../util/Helper";
import {Filter} from "../filter/Filter";

/**
 * retrieves composite games
 * Joins:
 * - game_settings (1:n)
 *  - difficulty (1:1)
 * - helptexts_games (1:n)
 * - helptexts (1:n)
 *  - texts (1:1)
 */
export class GameCompositeFacade extends EntityFacade<Game> {

    private _gameFacade: GameFacade;
    private _gameSettingsFacade: GameSettingFacade;
    private _helptextsGamesFacade: HelptextsGamesFacade;
    private _helptextFacade: HelptextFacade;

    private _withGameSettingsJoin: boolean;
    private _withDifficultyJoin: boolean;
    private _withHelptextJoin: boolean;

    /**
     * @param tableAlias
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

        this._withGameSettingsJoin = true;
        this._withDifficultyJoin = true;
        this._withHelptextJoin = true;
    }

    /**
     * @param excludedSQLAttributes
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const returnAttributes: SQLAttributes = new SQLAttributes();

        returnAttributes.addSqlAttributes(this._gameFacade.getSQLAttributes(excludedSQLAttributes));

        if(this._withGameSettingsJoin) {
            returnAttributes.addSqlAttributes(this._gameSettingsFacade.getSQLAttributes(excludedSQLAttributes));
        }
        if(this._withHelptextJoin) {
            returnAttributes.addSqlAttributes(this._helptextsGamesFacade.getSQLAttributes(excludedSQLAttributes));
            returnAttributes.addSqlAttributes(this._helptextFacade.getSQLAttributes(excludedSQLAttributes));
        }

        return returnAttributes;
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    protected fillEntity(result: any): Game {
        const g: Game = this._gameFacade.fillEntity(result);

        if(this._withGameSettingsJoin) {
            const gs: GameSetting = this._gameSettingsFacade.fillEntity(result);
            g.addGameSetting(gs);
        }

        if(this._withHelptextJoin) {
            const ht: Helptext = this._helptextFacade.fillEntity(result);
            g.addHelptext(ht);
        }


        return g;
    }

    /**
     * creates the joins for the composite games and returns them as a list
     */
    public getJoins(): SQLJoin[] {
        let joins: SQLJoin[] = [];

        if(this._withGameSettingsJoin) {
            const gameSettingJoin: SQLBlock = new SQLBlock();
            gameSettingJoin.addText(`${this._gameSettingsFacade.tableAlias}.game_id = ${this.tableAlias}.id`);
            joins.push(new SQLJoin(this._gameSettingsFacade.tableName, this._gameSettingsFacade.tableAlias, gameSettingJoin, JoinType.JOIN));
        }

        joins = joins.concat(this._gameSettingsFacade.getJoins()); // add game-settings joins (difficulty)

        if(this._withHelptextJoin) {
            const helptextGamesJoin: SQLBlock = new SQLBlock();
            helptextGamesJoin.addText(`${this._helptextsGamesFacade.tableAlias}.game_id = ${this.tableAlias}.id`);
            joins.push(new SQLJoin(this._helptextsGamesFacade.tableName, this._helptextsGamesFacade.tableAlias, helptextGamesJoin, JoinType.JOIN));

            const helptextsJoin: SQLBlock = new SQLBlock();
            helptextsJoin.addText(`${this._helptextFacade.tableAlias}.helptext_id = ${this._helptextsGamesFacade.tableAlias}.helptext_id`);
            joins.push(new SQLJoin(this._helptextFacade.tableName, this._helptextFacade.tableAlias, helptextsJoin, JoinType.JOIN));

            joins = joins.concat(this._helptextFacade.getJoins()); // add helptext joins (text)
        }

        return joins;
    }

    /**
     * @param entities
     */
    protected postProcessSelect(entities: Game[]): Game[] {
        const gameMap = new Map<number, Game>();

        for (const game of entities) {
            if (!gameMap.has(game.id)) {
                gameMap.set(game.id, game)
            } else {
                const existingGame: Game = gameMap.get(game.id);

                if(!Helper.arrayContainsModel(game.helptexts[0], existingGame.helptexts)) {
                    existingGame.addHelptexts(game.helptexts);
                }

                if(!Helper.arrayContainsModel(game.gameSettings[0], existingGame.gameSettings)) {
                    existingGame.addGameSettings(game.gameSettings);
                }
            }
        }

        return Array.from(gameMap.values());
    }

    get gameFacadeFilter(): Filter {
        return this._gameSettingsFacade.filter;
    }
    
    get helptextFacadeFilter(): Filter {
        return this._helptextFacade.filter;
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


}