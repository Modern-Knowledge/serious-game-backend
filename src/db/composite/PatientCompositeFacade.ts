import { Patient } from "../../lib/models/Patient";
import { Session } from "../../lib/models/Session";
import { arrayContainsModel } from "../../util/Helper";
import { PatientSettingFacade } from "../entity/settings/PatientSettingFacade";
import { PatientFacade } from "../entity/user/PatientFacade";
import { TherapistsPatientsFacade } from "../entity/user/TherapistsPatientsFacade";
import { Filter } from "../filter/Filter";
import { Ordering } from "../order/Ordering";
import { JoinCardinality } from "../sql/enums/JoinCardinality";
import { JoinType } from "../sql/enums/JoinType";
import { SQLAttributes } from "../sql/SQLAttributes";
import { SQLBlock } from "../sql/SQLBlock";
import { SQLJoin } from "../sql/SQLJoin";
import { CompositeFacade } from "./CompositeFacade";
import { SessionCompositeFacade } from "./SessionCompositeFacade";

/**
 * Retrieve patients with patient-settings, sessions and therapists.
 *
 * contained Facades:
 * - PatientFacade
 * - PatientSettingFacade
 * - SessionCompositeFacade
 * - TherapistPatientsFacade
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

    /**
     * Creates the joins for the composite patients-facade and returns them as a list.
     */
    get joins(): SQLJoin[] {
        let joins: SQLJoin[] = [];

        joins = joins.concat(this._patientFacade.joins); // add patient joins (user)

        if (this._withPatientSettingJoin) {
            const patientSettingJoin: SQLBlock = new SQLBlock();
            patientSettingJoin.addText(
                `${this._patientSettingsFacade.tableAlias}.patient_id = ${this.tableAlias}.patient_id`
            );
            joins.push(new SQLJoin(
                this._patientSettingsFacade.tableName, this._patientSettingsFacade.tableAlias, patientSettingJoin,
                JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE)
            );
        }

        if (this._withSessionCompositeJoin) {
            const sessionJoin: SQLBlock = new SQLBlock();
            sessionJoin.addText(
                `${this._sessionCompositeFacade.tableAlias}.patient_id = ${this.tableAlias}.patient_id
                `);
            joins.push(new SQLJoin(
                this._sessionCompositeFacade.tableName, this._sessionCompositeFacade.tableAlias, sessionJoin,
                JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_MANY)
            );

            // add session composite joins (game, patient, user, statistic, errortext, game-settings, difficulty)
            joins = joins.concat(this._sessionCompositeFacade.joins);

        }

        return joins;
    }

    /**
     * Returns all sub-facade filters of the facade as an array.
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

    get therapistPatientFacadeFilter(): Filter {
        return this._therapistPatientFacade.filter;
    }

    /**
     * Returns all sub-facade order-bys of the facade as an array.
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

    private _patientFacade: PatientFacade;
    private readonly _patientSettingsFacade: PatientSettingFacade;
    private readonly _sessionCompositeFacade: SessionCompositeFacade;
    private readonly _therapistPatientFacade: TherapistsPatientsFacade;

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
     * @param tableAlias table-alias of the facade
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
        this._therapistPatientFacade = new TherapistsPatientsFacade();

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
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
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
     * Fills the patient-entity from the result. Joined entities are added to
     * the patient.
     *
     * @param result database-results
     */
    public fillEntity(result: any): Patient {
        if (!result[this.name("patient_id")]) {
            return undefined;
        }

        const p: Patient = this._patientFacade.fillEntity(result);

        if (this._withPatientSettingJoin) {
            const patientSetting = this._patientSettingsFacade.fillEntity(result);
            if (patientSetting) {
                p.patientSetting = patientSetting;
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
     * Delete the patient, the user, the patient-settings,
     * the session and the relationship with the therapists.
     */
    public async delete(): Promise<number> {
        return await this.deleteStatement([
            this._patientSettingsFacade, this._sessionCompositeFacade,
            this._therapistPatientFacade, this, this._patientFacade.userFacade
        ]);
    }

    /**
     * Post process the results of the select-query.
     * e.g.: Handle joined result set.
     *
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
}
