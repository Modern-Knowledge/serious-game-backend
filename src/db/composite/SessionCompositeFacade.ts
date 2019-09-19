import { EntityFacade } from "../entity/EntityFacade";
import { Therapist } from "../../lib/models/Therapist";
import { TherapistFacade } from "../entity/user/TherapistFacade";
import { PatientFacade } from "../entity/user/PatientFacade";
import { SQLAttributes } from "../sql/SQLAttributes";
import { SQLJoin } from "../sql/SQLJoin";
import { SQLBlock } from "../sql/SQLBlock";
import { JoinType } from "../sql/JoinType";
import { Patient } from "../../lib/models/Patient";
import { Session } from "../../lib/models/Session";
import { StatisticCompositeFacade } from "./StatisticCompositeFacade";
import { GameFacade } from "../entity/game/GameFacade";
import { GameSettingFacade } from "../entity/settings/GameSettingFacade";
import { Statistic } from "../../lib/models/Statistic";
import { Game } from "../../lib/models/Game";
import { GameSetting } from "../../lib/models/GameSetting";
import { SessionFacade } from "../entity/game/SessionFacade";
import {Helper} from "../../util/Helper";

/**
 * retrieves composite sessions with therapists (1:1), patients (1:1), statistics (1:1), game (1:1), game-settings (1:1)
 * Joins:
 * - therapists (1:1)
 * - patients (1:1)
 * - users (1:1)
 * - statistics (1:1)
 * - errortexts_statistics (1:n)
 * - errortexts (1:n)
 * - texts (1:1)
 * - severities (1:1)
 * - games (1:1)
 * - games_settings (1:1)
 * - difficulty (1:1)
 */
export class SessionCompositeFacade extends EntityFacade<Session> {

    private _sessionFacade: SessionFacade;
    private _therapistFacade: TherapistFacade;
    private _patientFacade: PatientFacade;
    private _statisticCompositeFacade: StatisticCompositeFacade;
    private _gameFacade: GameFacade;
    private _gameSettingsFacade: GameSettingFacade;

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
    }

    /**
     * @param excludedSQLAttributes
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const returnAttributes: SQLAttributes = new SQLAttributes();

        returnAttributes.addSqlAttributes(this._sessionFacade.getSQLAttributes(excludedSQLAttributes));
        returnAttributes.addSqlAttributes(this._therapistFacade.getSQLAttributes(excludedSQLAttributes));
        returnAttributes.addSqlAttributes(this._patientFacade.getSQLAttributes(excludedSQLAttributes));
        returnAttributes.addSqlAttributes(this._statisticCompositeFacade.getSQLAttributes(excludedSQLAttributes));
        returnAttributes.addSqlAttributes(this._gameFacade.getSQLAttributes(excludedSQLAttributes));
        returnAttributes.addSqlAttributes(this._gameSettingsFacade.getSQLAttributes(excludedSQLAttributes));

        return returnAttributes;
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    protected fillEntity(result: any): Session {
        const s: Session = this._sessionFacade.fillEntity(result);
        const st: Statistic = this._statisticCompositeFacade.fillEntity(result);
        const t: Therapist = this._therapistFacade.fillEntity(result);
        const p: Patient = this._patientFacade.fillEntity(result);
        const g: Game = this._gameFacade.fillEntity(result);
        const gs: GameSetting = this._gameSettingsFacade.fillEntity(result);

        s.statistic = st;
        s.therapist = t;
        s.patient = p;
        s.game = g;
        s.gameSetting = gs;

        return s;
    }

    /**
     * creates the joins for the composite sessions and returns them as a list
     */
    public getJoins(): SQLJoin[] {
        let joins: SQLJoin[] = [];

        const gameJoin: SQLBlock = new SQLBlock();
        gameJoin.addText(`${this._gameFacade.tableAlias}.id = ${this.tableAlias}.game_id`);
        joins.push(new SQLJoin(this._gameFacade.tableName, this._gameFacade.tableAlias, gameJoin, JoinType.JOIN));

        const patientJoin: SQLBlock = new SQLBlock();
        patientJoin.addText(`${this._patientFacade.tableAlias}.patient_id = ${this.tableAlias}.patient_id`);
        joins.push(new SQLJoin(this._patientFacade.tableName, this._patientFacade.tableAlias, patientJoin, JoinType.JOIN));

        joins = joins.concat(this._patientFacade.getJoins()); // add patient joins (user)

        const therapistJoin: SQLBlock = new SQLBlock();
        therapistJoin.addText(`${this._therapistFacade.tableAlias}.therapist_id = ${this.tableAlias}.therapist_id`);
        joins.push(new SQLJoin(this._therapistFacade.tableName, this._therapistFacade.tableAlias, therapistJoin, JoinType.JOIN));

        joins = joins.concat(this._therapistFacade.getJoins()); // add therapist joins (user)

        const statisticJoin: SQLBlock = new SQLBlock();
        statisticJoin.addText(`${this._statisticCompositeFacade.tableAlias}.id = ${this.tableAlias}.statistic_id`);
        joins.push(new SQLJoin(this._statisticCompositeFacade.tableName, this._statisticCompositeFacade.tableAlias, statisticJoin, JoinType.JOIN));

        joins = joins.concat(this._statisticCompositeFacade.getJoins()); // add statistic joins (errortext)

        const gameSettingJoin: SQLBlock = new SQLBlock();
        gameSettingJoin.addText(`${this._gameSettingsFacade.tableAlias}.id = ${this.tableAlias}.game_settings_id`);
        joins.push(new SQLJoin(this._gameSettingsFacade.tableName, this._gameSettingsFacade.tableAlias, gameSettingJoin, JoinType.JOIN));

        joins = joins.concat(this._gameSettingsFacade.getJoins()); // add game-settings joins (difficulty)

        return joins;
    }

    /**
     * @param entities
     * todo
     */
    protected postProcessSelect(entities: Session[]): Session[] {
        const sessionMap = new Map<number, Session>();

        for (const session of entities) {
            if (!sessionMap.has(session.id)) {
                sessionMap.set(session.id, session)
            } else {
                const existingSession: Session = sessionMap.get(session.id);
                const existingStatistic: Statistic = existingSession.statistic;

                const statistic: Statistic = session.statistic;

                if(!Helper.arrayContainsModel(statistic.errortexts[0], existingStatistic.errortexts)) {
                    existingStatistic.addErrortexts(statistic.errortexts);
                }
            }
        }

        return Array.from(sessionMap.values());
    }
}