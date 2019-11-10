import { PatientFacade } from "../entity/user/PatientFacade";
import { SQLAttributes } from "../sql/SQLAttributes";
import { SQLJoin } from "../sql/SQLJoin";
import { SQLBlock } from "../sql/SQLBlock";
import { JoinType } from "../sql/enums/JoinType";
import { Session } from "../../lib/models/Session";
import { StatisticCompositeFacade } from "./StatisticCompositeFacade";
import { GameFacade } from "../entity/game/GameFacade";
import { GameSettingFacade } from "../entity/settings/GameSettingFacade";
import { Statistic } from "../../lib/models/Statistic";
import { SessionFacade } from "../entity/game/SessionFacade";
import { Filter } from "../filter/Filter";
import { JoinCardinality } from "../sql/enums/JoinCardinality";
import { CompositeFacade } from "./CompositeFacade";
import { Ordering } from "../order/Ordering";
import { arrayContainsModel } from "../../util/Helper";

/**
 * retrieves composite sessions
 * contained Facades:
 * - SessionFacade
 * - PatientFacade
 * - StatisticCompositeFacade
 * - GameFacade
 * - GameSettingFacade
 *
 * contained Joins:
 * - patients (1:1)
 *  - users (1:1)
 * - statistics (1:1)
 *  - errortexts_statistics (1:n)
 *  - errortexts (1:n)
 *  - texts (1:1)
 *  - severities (1:1)
 * - games (1:1)
 * - games_settings (1:1)
 *  - difficulty (1:1)
 */
export class SessionCompositeFacade extends CompositeFacade<Session> {

    private _sessionFacade: SessionFacade;
    private _patientFacade: PatientFacade;
    private readonly _statisticCompositeFacade: StatisticCompositeFacade;
    private _gameFacade: GameFacade;
    private readonly _gameSettingsFacade: GameSettingFacade;

    private _withPatientJoin: boolean;
    private _withPatientUserJoin: boolean;

    private _withStatisticCompositeJoin: boolean;
    private _withErrortextJoin: boolean;
    private _withTextJoin: boolean;
    private _withSeverityJoin: boolean;
    private _withGameJoin: boolean;
    private _withGameSettingsJoin: boolean;
    private _withDifficultyJoin: boolean;

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("sessions", tableAlias);
        } else {
            super("sessions", "sess");
        }

        this._sessionFacade = new SessionFacade();

        // set tableAliases
        this._patientFacade = new PatientFacade("patcomp");
        this._patientFacade.userFacade.tableAlias = "patcompUser";

        this._statisticCompositeFacade = new StatisticCompositeFacade();
        this._gameFacade = new GameFacade();
        this._gameSettingsFacade = new GameSettingFacade();

        this._withPatientJoin = true;
        this._withPatientUserJoin = true;
        this._withStatisticCompositeJoin = true;
        this._withErrortextJoin = true;
        this._withTextJoin = true;
        this._withSeverityJoin = true;
        this._withGameJoin = true;
        this._withGameSettingsJoin = true;
        this._withDifficultyJoin = true;
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const returnAttributes: SQLAttributes = new SQLAttributes();

        returnAttributes.addSqlAttributes(this._sessionFacade.getSQLAttributes(excludedSQLAttributes));

        if (this._withPatientJoin) {
            returnAttributes.addSqlAttributes(this._patientFacade.getSQLAttributes(excludedSQLAttributes));
        }

        if (this._withStatisticCompositeJoin) {
            returnAttributes.addSqlAttributes(this._statisticCompositeFacade.getSQLAttributes(excludedSQLAttributes));
        }

        if (this._withGameJoin) {
            returnAttributes.addSqlAttributes(this._gameFacade.getSQLAttributes(excludedSQLAttributes));
        }

        if (this._gameSettingsFacade) {
            returnAttributes.addSqlAttributes(this._gameSettingsFacade.getSQLAttributes(excludedSQLAttributes));
        }

        return returnAttributes;
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Session {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const s: Session = this._sessionFacade.fillEntity(result);

        if (this._withStatisticCompositeJoin) {
            const statistic = this._statisticCompositeFacade.fillEntity(result);
            if (statistic) {
                s.statistic = statistic;
            }
        }

        if (this._withPatientJoin) {
            const patient = this._patientFacade.fillEntity(result);
            if (patient) {
                s.patient = patient;
            }
        }

        if (this._withGameJoin) {
            const game = this._gameFacade.fillEntity(result);
            if (game) {
                s.game = this._gameFacade.fillEntity(result);
            }
        }

        if (this._withGameSettingsJoin) {
            const gameSetting = this._gameSettingsFacade.fillEntity(result);
            if (gameSetting) {
                s.gameSetting = this._gameSettingsFacade.fillEntity(result);
            }
        }

        return s;
    }

    /**
     * creates the joins for the composite sessions facade and returns them as a list
     */
    get joins(): SQLJoin[] {
        let joins: SQLJoin[] = [];

        if (this._withGameJoin) {
            const gameJoin: SQLBlock = new SQLBlock();
            gameJoin.addText(`${this._gameFacade.tableAlias}.id = ${this.tableAlias}.game_id`);
            joins.push(new SQLJoin(this._gameFacade.tableName, this._gameFacade.tableAlias, gameJoin, JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE));
        }

        if (this._withPatientJoin) {
            const patientJoin: SQLBlock = new SQLBlock();
            patientJoin.addText(`${this._patientFacade.tableAlias}.patient_id = ${this.tableAlias}.patient_id`);
            joins.push(new SQLJoin(this._patientFacade.tableName, this._patientFacade.tableAlias, patientJoin, JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE));

            joins = joins.concat(this._patientFacade.joins); // add patient joins (user)
        }

        if (this._withStatisticCompositeJoin) {
            const statisticJoin: SQLBlock = new SQLBlock();
            statisticJoin.addText(`${this._statisticCompositeFacade.tableAlias}.id = ${this.tableAlias}.statistic_id`);
            joins.push(new SQLJoin(this._statisticCompositeFacade.tableName, this._statisticCompositeFacade.tableAlias, statisticJoin, JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE));

            joins = joins.concat(this._statisticCompositeFacade.joins); // add statistic joins (errortext)
        }

        if (this._withGameSettingsJoin) {
            const gameSettingJoin: SQLBlock = new SQLBlock();
            gameSettingJoin.addText(`${this._gameSettingsFacade.tableAlias}.id = ${this.tableAlias}.game_setting_id`);
            joins.push(new SQLJoin(this._gameSettingsFacade.tableName, this._gameSettingsFacade.tableAlias, gameSettingJoin, JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE));

            joins = joins.concat(this._gameSettingsFacade.joins); // add game-settings joins (difficulty)
        }

        return joins;
    }

    /**
     * post process the results of the select query
     * e.g.: handle joins
     * @param entities entities that where returned from the database
     */
    protected postProcessSelect(entities: Session[]): Session[] {
        const sessionMap = new Map<number, Session>();

        for (const session of entities) {
            if (!sessionMap.has(session.id)) {
                sessionMap.set(session.id, session);
            } else {
                const existingSession: Session = sessionMap.get(session.id);
                const existingStatistic: Statistic = existingSession.statistic;

                const statistic: Statistic = session.statistic;

                if (!arrayContainsModel(statistic.errortexts[0], existingStatistic.errortexts)) {
                    existingStatistic.errortexts = existingStatistic.errortexts.concat(statistic.errortexts);
                }
            }
        }

        return Array.from(sessionMap.values());
    }

    /**
     * deletes the session, the statistic and the errortextStatistic
     */
    public async deleteSessionComposite(): Promise<number> {
        return await this.delete([this._statisticCompositeFacade.errortextStatisticFacade, this, this._statisticCompositeFacade]);
    }

    /**
     * returns all sub facade filters of the facade as an array
     */
    protected get filters(): Filter[] {
        return [
            this.patientFacadeFilter,
            this.patientUserFacadeFilter,
            this.statisticFacadeFilter,
            this.errortextStatisticFacadeFilter,
            this.errortextFacadeFilter,
            this.textFacadeFilter,
            this.severityFacadeFilter,
            this.gameFacadeFilter,
            this.gameSettingFacadeFilter,
            this.difficultyFacadeFilter
        ];
    }

    get patientFacadeFilter(): Filter {
        return this._patientFacade.filter;
    }

    get patientUserFacadeFilter(): Filter {
        return this._patientFacade.userFacadeFilter;
    }

    get statisticFacadeFilter(): Filter {
        return this._statisticCompositeFacade.filter;
    }

    get errortextStatisticFacadeFilter(): Filter {
        return this._statisticCompositeFacade.errortextStatisticFilter;
    }

    get errortextFacadeFilter(): Filter {
        return this._statisticCompositeFacade.errortextFacadeFilter;
    }

    get textFacadeFilter(): Filter {
        return this._statisticCompositeFacade.textFacadeFilter;
    }

    get severityFacadeFilter(): Filter {
        return this._statisticCompositeFacade.severityFacadeFilter;
    }

    get gameFacadeFilter(): Filter {
        return this._gameFacade.filter;
    }

    get gameSettingFacadeFilter(): Filter {
        return this._gameSettingsFacade.filter;
    }

    get difficultyFacadeFilter(): Filter {
        return this._gameSettingsFacade.difficultyFacadeFilter;
    }

    /**
     * returns all sub facade order-bys of the facade as an array
     */
    protected get orderBys(): Ordering[] {
        return [
            this.patientFacadeOrderBy,
            this.patientUserFacadeOrderBy,
            this.statisticFacadeOrderBy,
            this.errortextFacadeOrderBy,
            this.textFacadeOrderBy,
            this.severityFacadeOrderBy,
            this.gameFacadeOrderBy,
            this.gameSettingFacadeOrderBy,
            this.difficultyFacadeOrderBy
        ];
    }

    get patientFacadeOrderBy(): Ordering {
        return this._patientFacade.ordering;
    }

    get patientUserFacadeOrderBy(): Ordering {
        return this._patientFacade.userFacadeOrderBy;
    }

    get statisticFacadeOrderBy(): Ordering {
        return this._statisticCompositeFacade.ordering;
    }

    get errortextFacadeOrderBy(): Ordering {
        return this._statisticCompositeFacade.errortextFacadeOrderBy;
    }

    get textFacadeOrderBy(): Ordering {
        return this._statisticCompositeFacade.textFacadeOrderBy;
    }

    get severityFacadeOrderBy(): Ordering {
        return this._statisticCompositeFacade.severityFacadeOrderBy;
    }

    get gameFacadeOrderBy(): Ordering {
        return this._gameFacade.ordering;
    }

    get gameSettingFacadeOrderBy(): Ordering {
        return this._gameSettingsFacade.ordering;
    }

    get difficultyFacadeOrderBy(): Ordering {
        return this._gameSettingsFacade.difficultyFacadeOrderBy;
    }

    get withPatientJoin(): boolean {
        return this._withPatientJoin;
    }

    set withPatientJoin(value: boolean) {
        this._withPatientJoin = value;
    }

    get withPatientUserJoin(): boolean {
        return this._withPatientUserJoin;
    }

    set withPatientUserJoin(value: boolean) {
        this._patientFacade.withUserJoin = value;
        this._withPatientUserJoin = value;
    }

    get withStatisticCompositeJoin(): boolean {
        return this._withStatisticCompositeJoin;
    }

    set withStatisticCompositeJoin(value: boolean) {
        this._statisticCompositeFacade.withErrortextJoin = value;
        this._statisticCompositeFacade.withTextJoin = value;
        this._withStatisticCompositeJoin = value;
    }

    get withErrortextJoin(): boolean {
        return this._withErrortextJoin;
    }

    set withErrortextJoin(value: boolean) {
        this._statisticCompositeFacade.withErrortextJoin = value;
        this._withErrortextJoin = value;
    }

    get withTextJoin(): boolean {
        return this._withTextJoin;
    }

    set withTextJoin(value: boolean) {
        this._statisticCompositeFacade.withTextJoin = value;
        this._withTextJoin = value;
    }

    get withSeverityJoin(): boolean {
        return this._withSeverityJoin;
    }

    set withSeverityJoin(value: boolean) {
        this._statisticCompositeFacade.withSeverityJoin = value;
        this._withSeverityJoin = value;
    }

    get withGameJoin(): boolean {
        return this._withGameJoin;
    }

    set withGameJoin(value: boolean) {
        this._withGameJoin = value;
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
}