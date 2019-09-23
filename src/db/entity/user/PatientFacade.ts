import { UserFacade } from "./UserFacade";
import { User } from "../../../lib/models/User";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLComparisonOperator } from "../../sql/SQLComparisonOperator";
import { SQLJoin } from "../../sql/SQLJoin";
import { JoinType } from "../../sql/enums/JoinType";
import { SQLBlock } from "../../sql/SQLBlock";
import { Patient } from "../../../lib/models/Patient";
import { Filter } from "../../filter/Filter";
import { JoinCardinality } from "../../sql/enums/JoinCardinality";
import { CompositeFacade } from "../../composite/CompositeFacade";
import { Ordering } from "../../order/Ordering";

/**
 * handles crud operations with the patient-entity
 * contained Facade:
 * - UserFacade
 *
 * contained Joins:
 * - users (1:1)
 */
export class PatientFacade extends CompositeFacade<Patient> {

    private _userFacade: UserFacade;

    private _withUserJoin: boolean;

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("patients", tableAlias);
        } else {
            super("patients", "p");
        }

        this._userFacade = new UserFacade("up");
        this._withUserJoin = true;
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["patient_id", "birthday", "info"];

        const patientsAttributes: SQLAttributes = new SQLAttributes(this.tableAlias, sqlAttributes);

        if (this._withUserJoin) {
            const userAttributes: SQLAttributes = this._userFacade.getSQLAttributes(excludedSQLAttributes);
            patientsAttributes.addSqlAttributes(userAttributes);
        }

        return patientsAttributes;
    }

    /**
     * inserts a new therapist and returns the created therapist
     * @param patient patient to insert
     */
    public async insertPatient(patient: Patient): Promise<Patient> {
        const t: User = await this._userFacade.insertUser(patient);

        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const patientIdAttribute: SQLValueAttribute = new SQLValueAttribute("patient_id", this.tableName, t.id);
        attributes.addAttribute(patientIdAttribute);

        const birthdayAttribute: SQLValueAttribute = new SQLValueAttribute("birthday", this.tableName, patient.birthday);
        attributes.addAttribute(birthdayAttribute);

        const infoAttribute: SQLValueAttribute = new SQLValueAttribute("info", this.tableName, patient.info);
        attributes.addAttribute(infoAttribute);

        return new Promise<Patient>((resolve, reject) => {
            this.insert(attributes).then(id => {
                if (id > 0) {
                    patient.id = t.id;
                    patient.createdAt = t.createdAt;
                    resolve(patient);
                }
            });
        });
    }

    /**
     * updates the given therapist in the database and returns the number of affected rows
     * @param patient patient to update
     */
    public async updatePatient(patient: Patient): Promise<number> {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const birthdayAttribute: SQLValueAttribute = new SQLValueAttribute("birthday", this.tableAlias, patient.birthday);
        attributes.addAttribute(birthdayAttribute);

        const infoAttribute: SQLValueAttribute = new SQLValueAttribute("info", this.tableAlias, patient.info);
        attributes.addAttribute(infoAttribute);

        const userRows: number = await this._userFacade.updateUser(patient);
        const patientRows: number = await this.update(attributes);

        return userRows + patientRows;
    }

    /**
     * deletes the specified therapist in the database and returns the number of affected rows
     * @param patient patient to delete
     */
    public async deletePatient(patient: Patient): Promise<number> {
        this.filter.addFilterCondition("patient_id", patient.id, SQLComparisonOperator.EQUAL);
        const rows: number = await this.delete();

        const userRows: number = await this._userFacade.deleteUser(patient);

        return rows + userRows;
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Patient {
        const p: Patient = new Patient();

        if (this._withUserJoin) {
            this._userFacade.fillUserEntity(result, p);
        }

        if (result[this.name("birthday")] !== undefined) {
            p.birthday = result[this.name("birthday")];
        }

        if (result[this.name("info")] !== undefined) {
            p.info = result[this.name("info")];
        }

        return p;
    }

    /**
     * creates the joins for the patient facade and returns them as a list
     */
    get joins(): SQLJoin[] {
        const joins: SQLJoin[] = [];

        if (this._withUserJoin) {
            const userJoin: SQLBlock = new SQLBlock();
            userJoin.addText(`${this.tableAlias}.patient_id = ${this._userFacade.tableAlias}.id`);
            joins.push(new SQLJoin(this._userFacade.tableName, this._userFacade.tableAlias, userJoin, JoinType.JOIN, JoinCardinality.ONE_TO_ONE));
        }

        return joins;
    }

    /**
     * returns all sub facade filters of the facade as an array
     */
    protected get filters(): Filter[] {
        return [
            this.userFacadeFilter
        ];
    }

    get userFacadeFilter(): Filter {
        return this._userFacade.filter;
    }

    /**
     * returns all sub facade order-bys of the facade as an array
     */
    protected get orderBys(): Ordering[] {
        return [
            this.userFacadeOrderBy
        ];
    }

    get userFacadeOrderBy(): Ordering {
        return this._userFacade.ordering;
    }

    get withUserJoin(): boolean {
        return this._withUserJoin;
    }

    set withUserJoin(value: boolean) {
        this._withUserJoin = value;
    }

    /**
     * returns the facade filter that can be used for filtering model with id
     */
    get idFilter(): Filter {
        return new Filter(this._userFacade.tableAlias);
    }
}
