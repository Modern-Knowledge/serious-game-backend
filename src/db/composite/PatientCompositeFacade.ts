import { SQLAttributes } from "../sql/SQLAttributes";
import { SQLJoin } from "../sql/SQLJoin";
import { SQLBlock } from "../sql/SQLBlock";
import { JoinType } from "../sql/enums/JoinType";
import { Patient } from "../../lib/models/Patient";
import { PatientFacade } from "../entity/user/PatientFacade";
import { PatientSettingFacade } from "../entity/settings/PatientSettingFacade";
import { Session } from "../../lib/models/Session";
import { Filter } from "../filter/Filter";
import { JoinCardinality } from "../sql/enums/JoinCardinality";
import { CompositeFacade } from "./CompositeFacade";
import { Ordering } from "../order/Ordering";
import { arrayContainsModel } from "../../util/Helper";
import { SessionCompositeFacade } from "./SessionCompositeFacade";

/**
 * retrieves composite patients
 * contained Facades:
 * - PatientFacade
 * - PatientSettingFacade
 * - SessionCompositeFacade
 *
 * contained Joins:
 * - users (1:1)
 * - patient_setting (1:1)
 * - sessions (1:n)
 *   - patient (1:1)
 *     - users (1:1)
 *   - statistics (1:1)
 *     - errortexts_statistics (1:n)
 *     - errortexts (1:n)
 *     - texts (1:1)
 *     - severities (1:1)
 *   - games (1:1)
 *   - games_settings (1:1)
 *     - difficulty (1:1)
 */
export class PatientCompositeFacade extends CompositeFacade<Patient> {

    private _patientFacade: PatientFacade;
    private _patientSettingsFacade: PatientSettingFacade;
    private _sessionCompositeFacade: SessionCompositeFacade;

    private _withUserJoin: boolean;
    private _withPatientSettingJoin: boolean;
    private _withSessionCompositeJoin: boolean;
    private _withPatientSessionJoin: boolean;
    private _withPatientUserSessionJoin: boolean;
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
            super("patients", tableAlias);
        } else {
            super("patients", "p");
        }

        this._patientFacade = new PatientFacade();
        this._patientSettingsFacade = new PatientSettingFacade();
        this._sessionCompositeFacade = new SessionCompositeFacade();

        this._withUserJoin = true;
        this._withPatientSettingJoin = true;
        this._withSessionCompositeJoin = true;

        this._withPatientSessionJoin = true;
        this._withPatientUserSessionJoin = true;
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

        returnAttributes.addSqlAttributes(this._patientFacade.getSQLAttributes(excludedSQLAttributes));

        if (this._withPatientSettingJoin) {
            returnAttributes.addSqlAttributes(this._patientSettingsFacade.getSQLAttributes(excludedSQLAttributes));
        }
        if (this._withSessionCompositeJoin) {
            returnAttributes.addSqlAttributes(this._sessionCompositeFacade.getSQLAttributes(excludedSQLAttributes));
        }

        return returnAttributes;
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Patient {
        if (!result[this.name("patient_id")]) {
            return undefined;
        }

        const p: Patient = this._patientFacade.fillEntity(result);

        if (this._withPatientSettingJoin) {
            const patientSetting = this._patientSettingsFacade.fillEntity(result);
            if (patientSetting) {
                p.patientSetting = this._patientSettingsFacade.fillEntity(result);
            }
        }

        if (this._withSessionCompositeJoin) {
            const s: Session = this._sessionCompositeFacade.fillEntity(result);
            if (s) {
                p.sessions.push(s);
            }
        }

        return p;
    }

    /**
     * creates the joins for the composite patients facade and returns them as a list
     */
    get joins(): SQLJoin[] {
        let joins: SQLJoin[] = [];

        joins = joins.concat(this._patientFacade.joins); // add patient joins (user)

        if (this._withPatientSettingJoin) {
            const patientSettingJoin: SQLBlock = new SQLBlock();
            patientSettingJoin.addText(`${this._patientSettingsFacade.tableAlias}.patient_id = ${this.tableAlias}.patient_id`);
            joins.push(new SQLJoin(this._patientSettingsFacade.tableName, this._patientSettingsFacade.tableAlias, patientSettingJoin, JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE));
        }

        if (this._withSessionCompositeJoin) {
            const sessionJoin: SQLBlock = new SQLBlock();
            sessionJoin.addText(`${this._sessionCompositeFacade.tableAlias}.patient_id = ${this.tableAlias}.patient_id`);
            joins.push(new SQLJoin(this._sessionCompositeFacade.tableName, this._sessionCompositeFacade.tableAlias, sessionJoin, JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_MANY));

            joins = joins.concat(this._sessionCompositeFacade.joins); // add session composite joins (game, patient, user, statistic, errortext, game-settings, difficulty)

        }

        return joins;
    }

    /**
     * post process the results of the select query
     * e.g.: handle joins
     * @param entities entities that where returned from the database
     */
    protected postProcessSelect(entities: Patient[]): Patient[] {
        const patientMap = new Map<number, Patient>();

        for (const patient of entities) {
            if (!patientMap.has(patient.id)) {
                patientMap.set(patient.id, patient);
            } else {
                const existingPatient: Patient = patientMap.get(patient.id);

                if (!arrayContainsModel(patient.sessions[0], existingPatient.sessions)) {
                    existingPatient.sessions = existingPatient.sessions.concat(patient.sessions);
                }
            }
        }

        return Array.from(patientMap.values());
    }

    /**
     * delete the patient, the user and the patient settings
     */
    public async deletePatientComposite(): Promise<number> {
        return await this.delete([this._patientSettingsFacade, this, this._patientFacade.userFacade]);
    }

    /**
     * returns all sub facade filters of the facade as an array
     */
    protected get filters(): Filter[] {
        return [
            this.patientUserFacadeFilter,
            this.patientSettingFacadeFilter,
            this.sessionFacadeFilter
        ];
    }

    get patientUserFacadeFilter(): Filter {
        return this._patientFacade.userFacadeFilter;
    }

    get patientSettingFacadeFilter(): Filter {
        return this._patientSettingsFacade.filter;
    }

    get sessionFacadeFilter(): Filter {
        return this._sessionCompositeFacade.filter;
    }

    /**
     * returns all sub facade order-bys of the facade as an array
     */
    protected get orderBys(): Ordering[] {
        return [
            this.patientUserFacadeOrderBy,
            this.patientSettingFacadeOrderBy,
            this.sessionFacadeOrderBy,
        ];
    }

    get patientUserFacadeOrderBy(): Ordering {
        return this._patientFacade.userFacadeOrderBy;
    }

    get patientSettingFacadeOrderBy(): Ordering {
        return this._patientSettingsFacade.ordering;
    }

    get sessionFacadeOrderBy(): Ordering {
        return this._sessionCompositeFacade.ordering;
    }

    get withUserJoin(): boolean {
        return this._withUserJoin;
    }

    set withUserJoin(value: boolean) {
        this._withUserJoin = value;
    }

    get withPatientSettingJoin(): boolean {
        return this._withPatientSettingJoin;
    }

    set withPatientSettingJoin(value: boolean) {
        this._withPatientSettingJoin = value;
    }

    get withSessionCompositeJoin(): boolean {
        return this._withSessionCompositeJoin;
    }

    set withSessionCompositeJoin(value: boolean) {
        this._withSessionCompositeJoin = value;
    }

    get withPatientSessionJoin(): boolean {
        return this._withPatientSessionJoin;
    }

    set withPatientSessionJoin(value: boolean) {
        this._sessionCompositeFacade.withPatientJoin = value;
        this._withPatientSessionJoin = value;
    }

    get withPatientUserSessionJoin(): boolean {
        return this._withPatientUserSessionJoin;
    }

    set withPatientUserSessionJoin(value: boolean) {
        this._sessionCompositeFacade.withPatientUserJoin = value;
        this._withPatientUserSessionJoin = value;
    }

    get withStatisticCompositeJoin(): boolean {
        return this._withStatisticCompositeJoin;
    }

    set withStatisticCompositeJoin(value: boolean) {
        this._sessionCompositeFacade.withStatisticCompositeJoin = value;
        this._withStatisticCompositeJoin = value;
    }

    get withErrortextJoin(): boolean {
        return this._withErrortextJoin;
    }

    set withErrortextJoin(value: boolean) {
        this._sessionCompositeFacade.withErrortextJoin = value;
        this._withErrortextJoin = value;
    }

    get withTextJoin(): boolean {
        return this._withTextJoin;
    }

    set withTextJoin(value: boolean) {
        this._sessionCompositeFacade.withTextJoin = value;
        this._withTextJoin = value;
    }

    get withSeverityJoin(): boolean {
        return this._withSeverityJoin;
    }

    set withSeverityJoin(value: boolean) {
        this._sessionCompositeFacade.withSeverityJoin = value;
        this._withSeverityJoin = value;
    }

    get withGameJoin(): boolean {
        return this._withGameJoin;
    }

    set withGameJoin(value: boolean) {
        this._sessionCompositeFacade.withGameJoin = value;
        this._withGameJoin = value;
    }

    get withGameSettingsJoin(): boolean {
        return this._withGameSettingsJoin;
    }

    set withGameSettingsJoin(value: boolean) {
        this._sessionCompositeFacade.withGameSettingsJoin = value;
        this._withGameSettingsJoin = value;
    }

    get withDifficultyJoin(): boolean {
        return this._withDifficultyJoin;
    }

    set withDifficultyJoin(value: boolean) {
        this._sessionCompositeFacade.withDifficultyJoin = value;
        this._withDifficultyJoin = value;
    }

    get idFilter(): Filter {
        return this.patientUserFacadeFilter;
    }
}