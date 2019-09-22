import { EntityFacade } from "../entity/EntityFacade";
import { TherapistFacade } from "../entity/user/TherapistFacade";
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
import { Helper } from "../../util/Helper";
import { Filter } from "../filter/Filter";
import { JoinCardinality } from "../sql/enums/JoinCardinality";
import { CompositeFacade } from "./CompositeFacade";

/**
 * retrieves composite sessions
 * contained Facades:
 * - SessionFacade
 * - TherapistFacade
 * - PatientFacade
 * - StatisticCompositeFacade
 * - GameFacade
 * - GameSettingFacade
 *
 * contained Joins:
 * - therapists (1:1)
 *  - users (1:1)
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
    private _therapistFacade: TherapistFacade;
    private _patientFacade: PatientFacade;
    private _statisticCompositeFacade: StatisticCompositeFacade;
    private _gameFacade: GameFacade;
    private _gameSettingsFacade: GameSettingFacade;

    private _withTherapistJoin: boolean;
    private _withTherapistUserJoin: boolean;
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
        this._therapistFacade = new TherapistFacade();
        this._patientFacade = new PatientFacade();
        this._statisticCompositeFacade = new StatisticCompositeFacade();
        this._gameFacade = new GameFacade();
        this._gameSettingsFacade = new GameSettingFacade();

        this._withTherapistJoin = true;
        this._withTherapistUserJoin = true;
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

        if (this._withTherapistJoin) {
            returnAttributes.addSqlAttributes(this._therapistFacade.getSQLAttributes(excludedSQLAttributes));
        }

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
    protected fillEntity(result: any): Session {
        const s: Session = this._sessionFacade.fillEntity(result);
        if (this._withStatisticCompositeJoin) {
            s.statistic = this._statisticCompositeFacade.fillEntity(result);
        }

        if (this._withTherapistJoin) {
            s.therapist = this._therapistFacade.fillEntity(result);
        }

        if (this._withPatientJoin) {
            s.patient = this._patientFacade.fillEntity(result);
        }

        if (this._withGameJoin) {
            s.game = this._gameFacade.fillEntity(result);
        }

        if (this._withGameSettingsJoin) {
            s.gameSetting = this._gameSettingsFacade.fillEntity(result);
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
            joins.push(new SQLJoin(this._gameFacade.tableName, this._gameFacade.tableAlias, gameJoin, JoinType.JOIN, JoinCardinality.ONE_TO_ONE));
        }

        if (this._withPatientJoin) {
            const patientJoin: SQLBlock = new SQLBlock();
            patientJoin.addText(`${this._patientFacade.tableAlias}.patient_id = ${this.tableAlias}.patient_id`);
            joins.push(new SQLJoin(this._patientFacade.tableName, this._patientFacade.tableAlias, patientJoin, JoinType.JOIN, JoinCardinality.ONE_TO_ONE));

            joins = joins.concat(this._patientFacade.joins); // add patient joins (user)
        }

        if (this._withTherapistJoin) {
            const therapistJoin: SQLBlock = new SQLBlock();
            therapistJoin.addText(`${this._therapistFacade.tableAlias}.therapist_id = ${this.tableAlias}.therapist_id`);
            joins.push(new SQLJoin(this._therapistFacade.tableName, this._therapistFacade.tableAlias, therapistJoin, JoinType.JOIN, JoinCardinality.ONE_TO_ONE));

            joins = joins.concat(this._therapistFacade.joins); // add therapist joins (user)
        }

        if (this._withStatisticCompositeJoin) {
            const statisticJoin: SQLBlock = new SQLBlock();
            statisticJoin.addText(`${this._statisticCompositeFacade.tableAlias}.id = ${this.tableAlias}.statistic_id`);
            joins.push(new SQLJoin(this._statisticCompositeFacade.tableName, this._statisticCompositeFacade.tableAlias, statisticJoin, JoinType.JOIN, JoinCardinality.ONE_TO_ONE));

            joins = joins.concat(this._statisticCompositeFacade.joins); // add statistic joins (errortext)
        }

        if (this._withGameSettingsJoin) {
            const gameSettingJoin: SQLBlock = new SQLBlock();
            gameSettingJoin.addText(`${this._gameSettingsFacade.tableAlias}.id = ${this.tableAlias}.game_settings_id`);
            joins.push(new SQLJoin(this._gameSettingsFacade.tableName, this._gameSettingsFacade.tableAlias, gameSettingJoin, JoinType.JOIN, JoinCardinality.ONE_TO_ONE));

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

                if (!Helper.arrayContainsModel(statistic.errortexts[0], existingStatistic.errortexts)) {
                    existingStatistic.errortexts = existingStatistic.errortexts.concat(statistic.errortexts);
                }
            }
        }

        return Array.from(sessionMap.values());
    }

    /**
     * returns all sub facade filters of the facade as an array
     */
    protected get filters(): Filter[] {
        return [
            this.therapistFacadeFilter,
            this.therapistUserFacadeFilter,
            this.patientFacadeFilter,
            this.patientUserFacadeFilter,
            this.statisticFacadeFilter,
            this.errortextFacadeFilter,
            this.textFacadeFilter,
            this.severityFacadeFilter,
            this.gameFacadeFilter,
            this.gameSettingFacadeFilter,
            this.difficultyFacadeFilter
        ];
    }

    get therapistFacadeFilter(): Filter {
        return this._therapistFacade.filter;
    }

    get therapistUserFacadeFilter(): Filter {
        return this._therapistFacade.userFacadeFilter;
    }

    get patientFacadeFilter(): Filter {
        return this._therapistFacade.filter;
    }

    get patientUserFacadeFilter(): Filter {
        return this._patientFacade.userFacadeFilter;
    }

    get statisticFacadeFilter(): Filter {
        return this._statisticCompositeFacade.statisticFacadeFilter;
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

    get withTherapistJoin(): boolean {
        return this._withTherapistJoin;
    }

    set withTherapistJoin(value: boolean) {
        this._withTherapistJoin = value;
    }

    get withPatientJoin(): boolean {
        return this._withPatientJoin;
    }

    set withPatientJoin(value: boolean) {
        this._withPatientJoin = value;
    }

    get withTherapistUserJoin(): boolean {
        return this._withTherapistUserJoin;
    }

    set withTherapistUserJoin(value: boolean) {
        this._therapistFacade.withUserJoin = value;
        this._withTherapistUserJoin = value;
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