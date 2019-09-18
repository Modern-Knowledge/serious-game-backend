import { EntityFacade } from "../entity/EntityFacade";
import { SQLAttributes } from "../sql/SQLAttributes";
import { SQLJoin } from "../sql/SQLJoin";
import { SQLBlock } from "../sql/SQLBlock";
import { JoinType } from "../sql/JoinType";
import { Patient } from "../../lib/models/Patient";
import { PatientFacade } from "../entity/user/PatientFacade";
import { PatientSetting } from "../../lib/models/PatientSetting";
import { PatientSettingFacade } from "../entity/settings/PatientSettingFacade";
import { SessionFacade } from "../entity/game/SessionFacade";
import { Session } from "../../lib/models/Session";
import { Helper } from "../../util/Helper";

/**
 * retrieves composite patients
 * Joins:
 * - users (1:1)
 * - patient_setting (1:1)
 * - sessions (1:n)
 */
export class PatientCompositeFacade extends EntityFacade<Patient> {

    private _patientFacade: PatientFacade;
    private _patientSettingsFacade: PatientSettingFacade;
    private _sessionFacade: SessionFacade;

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
        this._sessionFacade = new SessionFacade();
    }

    /**
     * @param excludedSQLAttributes
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const returnAttributes: SQLAttributes = new SQLAttributes();

        returnAttributes.addSqlAttributes(this._patientFacade.getSQLAttributes(excludedSQLAttributes));
        returnAttributes.addSqlAttributes(this._patientSettingsFacade.getSQLAttributes(excludedSQLAttributes));
        returnAttributes.addSqlAttributes(this._sessionFacade.getSQLAttributes(excludedSQLAttributes));

        return returnAttributes;
    }

    /**
     * returns composite patients that match the specified filter
     * @param excludedSQLAttributes
     */
    public getPatients(excludedSQLAttributes?: string[]): Promise<Patient[]> {
        const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
        return this.select(attributes, this.getJoins());
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    protected fillEntity(result: any): Patient {
        const p: Patient = this._patientFacade.fillEntity(result);
        const ps: PatientSetting = this._patientSettingsFacade.fillEntity(result);
        const s: Session = this._sessionFacade.fillEntity(result);

        p.patientSetting = ps;
        p.addSession(s);

        return p;
    }

    /**
     * creates the joins for the composite patients and returns them as a list
     */
    public getJoins(): SQLJoin[] {
        let joins: SQLJoin[] = [];

        joins = joins.concat(this._patientFacade.getJoins()); // add patient joins (user)

        const patientSettingJoin: SQLBlock = new SQLBlock();
        patientSettingJoin.addText(`${this._patientSettingsFacade.tableAlias}.patient_id = ${this.tableAlias}.patient_id`);
        joins.push(new SQLJoin(this._patientSettingsFacade.tableName, this._patientSettingsFacade.tableAlias, patientSettingJoin, JoinType.JOIN));

        const sessionJoin: SQLBlock = new SQLBlock();
        sessionJoin.addText(`${this._sessionFacade.tableAlias}.patient_id = ${this.tableAlias}.patient_id`);
        joins.push(new SQLJoin(this._sessionFacade.tableName, this._sessionFacade.tableAlias, sessionJoin, JoinType.JOIN));

        return joins;
    }

    /**
     *
     * @param entities
     */
    protected postProcessSelect(entities: Patient[]): Patient[] {
        const patientMap = new Map<number, Patient>();

        for (const patient of entities) {
            if (!patientMap.has(patient.id)) {
                patientMap.set(patient.id, patient)
            } else {
                const existingPatient: Patient = patientMap.get(patient.id);

                if(!Helper.arrayContainsModel(patient.sessions[0], existingPatient.sessions)) {
                    existingPatient.addSessions(patient.sessions);
                }
            }
        }

        return Array.from(patientMap.values());
    }
}