import { SQLAttributes } from "../sql/SQLAttributes";
import { SQLJoin } from "../sql/SQLJoin";
import { SQLBlock } from "../sql/SQLBlock";
import { JoinType } from "../sql/enums/JoinType";
import { Patient } from "../../lib/models/Patient";
import { PatientFacade } from "../entity/user/PatientFacade";
import { PatientSettingFacade } from "../entity/settings/PatientSettingFacade";
import { SessionFacade } from "../entity/game/SessionFacade";
import { Session } from "../../lib/models/Session";
import { Helper } from "../../util/Helper";
import { Filter } from "../filter/Filter";
import { JoinCardinality } from "../sql/enums/JoinCardinality";
import { CompositeFacade } from "./CompositeFacade";
import { SQLOrderBy } from "../sql/SQLOrderBy";

/**
 * retrieves composite patients
 * contained Facades:
 * - PatientFacade
 * - PatientSettingFacade
 * - SessionFacade
 *
 * contained Joins:
 * - users (1:1)
 * - patient_setting (1:1)
 * - sessions (1:n)
 */
export class PatientCompositeFacade extends CompositeFacade<Patient> {

    private _patientFacade: PatientFacade;
    private _patientSettingsFacade: PatientSettingFacade;
    private _sessionFacade: SessionFacade;

    private _withUserJoin: boolean;
    private _withPatientSettingJoin: boolean;
    private _withSessionJoin: boolean;

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

        this._withUserJoin = true;
        this._withPatientSettingJoin = true;
        this._withSessionJoin = true;
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
        if (this._withSessionJoin) {
            returnAttributes.addSqlAttributes(this._sessionFacade.getSQLAttributes(excludedSQLAttributes));
        }

        return returnAttributes;
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    protected fillEntity(result: any): Patient {
        const p: Patient = this._patientFacade.fillEntity(result);
        if (this._withPatientSettingJoin) {
            p.patientSetting = this._patientSettingsFacade.fillEntity(result);
        }

        if (this._withSessionJoin) {
            const s: Session = this._sessionFacade.fillEntity(result);
            p.sessions.push(s);
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
            joins.push(new SQLJoin(this._patientSettingsFacade.tableName, this._patientSettingsFacade.tableAlias, patientSettingJoin, JoinType.JOIN, JoinCardinality.ONE_TO_ONE));
        }

        if (this._withSessionJoin) {
            const sessionJoin: SQLBlock = new SQLBlock();
            sessionJoin.addText(`${this._sessionFacade.tableAlias}.patient_id = ${this.tableAlias}.patient_id`);
            joins.push(new SQLJoin(this._sessionFacade.tableName, this._sessionFacade.tableAlias, sessionJoin, JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_MANY));
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

                if (!Helper.arrayContainsModel(patient.sessions[0], existingPatient.sessions)) {
                    existingPatient.sessions = existingPatient.sessions.concat(patient.sessions);
                }
            }
        }

        return Array.from(patientMap.values());
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
        return this._sessionFacade.filter;
    }

    /**
     * returns all sub facade order-bys of the facade as an array
     */
    protected get orderBys(): SQLOrderBy[][] {
        return [
            this.patientUserFacadeOrderBy,
            this.patientSettingFacadeOrderBy,
            this.sessionFacadeOrderBy,
        ];
    }

    get patientUserFacadeOrderBy(): SQLOrderBy[] {
        return this._patientFacade.orderBy;
    }

    get patientSettingFacadeOrderBy(): SQLOrderBy[] {
        return this._patientSettingsFacade.orderBy;
    }

    get sessionFacadeOrderBy(): SQLOrderBy[] {
        return this._sessionFacade.orderBy;
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

    get withSessionJoin(): boolean {
        return this._withSessionJoin;
    }

    set withSessionJoin(value: boolean) {
        this._withSessionJoin = value;
    }

    get idFilter(): Filter {
        return this.patientUserFacadeFilter;
    }
}