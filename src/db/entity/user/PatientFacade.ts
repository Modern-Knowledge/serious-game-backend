import { UserFacade } from "./UserFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
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
     * used in select statements
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["patient_id", "birthday", "info"];
        let excludedDefaultAttributes: string[] = ["id"];

        if (excludedSQLAttributes) {
            excludedDefaultAttributes = excludedDefaultAttributes.concat(excludedSQLAttributes);
        }

        const patientsAttributes: SQLAttributes = super.getSQLAttributes(excludedDefaultAttributes, sqlAttributes);

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
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(patient);

        /**
         * callback that is called after a user was inserted
         * @param insertId user id that was inserted before
         * @param attributes to append to
         */
        const onInsertUser = (insertId: number, attributes: SQLValueAttributes) => {
            patient.id = insertId;
            const patientIdAttribute: SQLValueAttribute = new SQLValueAttribute("patient_id", this.tableName, patient.id);
            attributes.addAttribute(patientIdAttribute);
        };

        await this.insert(attributes, [{facade: this._userFacade, entity: patient, callBackOnInsert: onInsertUser}, {facade: this, entity: patient}]);

        return patient;
    }

    /**
     * updates the patient and the associated user in a transaction
     * @param patient patient to update
     */
    public updateUserPatient(patient: Patient): Promise<number> {
        const attributes: SQLValueAttributes = this.getSQLUpdateValueAttributes(patient);
        return this.update(attributes, [{facade: this, entity: patient}, {facade: this._userFacade, entity: patient}]);
    }

    /**
     * updates the patients and returns the number of affected rows
     * @param patient patient to update
     */
    public updatePatient(patient: Patient): Promise<number> {
        const attributes: SQLValueAttributes = this.getSQLUpdateValueAttributes(patient);
        return this.update(attributes);
    }

    /**
     * deletes the patient and the associated user
     */
    public deletePatient(): Promise<number> {
        return this.delete([this, this._userFacade]);
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Patient {
        const p: Patient = new Patient();

        this.fillDefaultAttributes(result, p);

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
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
     * @param patient entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, patient: Patient): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const birthdayAttribute: SQLValueAttribute = new SQLValueAttribute("birthday", prefix, patient.birthday);
        attributes.addAttribute(birthdayAttribute);

        const infoAttribute: SQLValueAttribute = new SQLValueAttribute("info", prefix, patient.info);
        attributes.addAttribute(infoAttribute);

        return attributes;
    }

    /**
     * creates the joins for the patient facade and returns them as a list
     */
    get joins(): SQLJoin[] {
        const joins: SQLJoin[] = [];

        if (this._withUserJoin) {
            const userJoin: SQLBlock = new SQLBlock();
            userJoin.addText(`${this.tableAlias}.patient_id = ${this._userFacade.tableAlias}.id`);
            joins.push(new SQLJoin(this._userFacade.tableName, this._userFacade.tableAlias, userJoin, JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE));
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
        return this._userFacade.idFilter;
    }

    get userFacade(): UserFacade {
        return this._userFacade;
    }
}
