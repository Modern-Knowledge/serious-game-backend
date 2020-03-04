import { Patient } from "../../../lib/models/Patient";
import { CompositeFacade } from "../../composite/CompositeFacade";
import { Filter } from "../../filter/Filter";
import { Ordering } from "../../order/Ordering";
import { JoinCardinality } from "../../sql/enums/JoinCardinality";
import { JoinType } from "../../sql/enums/JoinType";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLBlock } from "../../sql/SQLBlock";
import { SQLJoin } from "../../sql/SQLJoin";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import {PatientSettingFacade} from "../settings/PatientSettingFacade";
import { UserFacade } from "./UserFacade";

/**
 * Handles CRUD-operations with the patient-entity.
 *
 * contained Facade:
 * - UserFacade
 * - PatientSettingsFacade
 *
 * contained Joins:
 * - users (1:1)
 */
export class PatientFacade extends CompositeFacade<Patient> {

    private readonly _userFacade: UserFacade;
    private readonly _patientSettingsFacade: PatientSettingFacade;

    private _withUserJoin: boolean;
    private _withPatientSettingsJoin: boolean;

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("patients", tableAlias);
        } else {
            super("patients", "p");
        }

        this._userFacade = new UserFacade("up");
        this._patientSettingsFacade = new PatientSettingFacade("psf");
        this._withUserJoin = true;
        this._withPatientSettingsJoin = false;
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
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

        if (this._withPatientSettingsJoin) {
            const patientSettingsAttributes: SQLAttributes =
                this._patientSettingsFacade.getSQLAttributes(excludedSQLAttributes);

            patientsAttributes.addSqlAttributes(patientSettingsAttributes);
        }

        return patientsAttributes;
    }

    /**
     * Inserts a new patient and returns the created patient.
     *
     * @param patient patient to insert
     */
    public async insert(patient: Patient): Promise<Patient> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(patient);

        /**
         * Callback that is called after a user was inserted.
         *
         * @param insertId user id that was inserted before
         * @param sqlValueAttributes to append to
         */
        const callBackOnInsert = (insertId: number, sqlValueAttributes: SQLValueAttributes) => {
            patient.id = insertId;

            const patientIdAttribute = new SQLValueAttribute("patient_id", this.tableName, patient.id);
            sqlValueAttributes.addAttribute(patientIdAttribute);
        };

        await this.insertStatement(attributes, [
                {facade: this._userFacade, entity: patient, callBackOnInsert},
                {facade: this, entity: patient},
            ]);

        return patient;
    }

    /**
     * Updates the patient and the associated user in a transaction.
     * Returns the number of affected rows in the database.
     *
     * @param patient patient to update
     */
    public updateUserPatient(patient: Patient): Promise<number> {
        const attributes: SQLValueAttributes = this.getSQLUpdateValueAttributes(patient);
        return this.updateStatement(attributes, [
                {facade: this, entity: patient},
                {facade: this._userFacade, entity: patient}
            ]);
    }

    /**
     * Updates patients and returns the number of affected rows.
     *
     * @param patient patient to update
     */
    public update(patient: Patient): Promise<number> {
        const attributes: SQLValueAttributes = this.getSQLUpdateValueAttributes(patient);
        return this.updateStatement(attributes);
    }

    /**
     * Updates the user, patient and the patient-settings.
     */
    public async updateUserPatientSetting(patient: Patient): Promise<number> {
        const attributes: SQLValueAttributes = this.getSQLUpdateValueAttributes(patient);
        return this.updateStatement(attributes, [
                {facade: this, entity: patient},
                {facade: this._userFacade, entity: patient},
                {facade: this._patientSettingsFacade, entity: patient}
            ]);
    }

    /**
     * Checks if the given id belongs to a patient.
     *
     * @param id id of the user that should be checked
     */
    public async isPatient(id: number): Promise<boolean> {
        const patient = await this.getById(id);
        return patient !== undefined;
    }

    /**
     * Fills the patient-entity from the result.
     *
     * @param result database results
     */
    public fillEntity(result: any): Patient {
        if (!result[this.name("patient_id")]) {
            return undefined;
        }

        const p: Patient = new Patient();

        if (this._withUserJoin) {
            this._userFacade.fillUserEntity(result, p);
        }

        if (this._withPatientSettingsJoin) {
            const patientSetting = this._patientSettingsFacade.fillEntity(result);
            if (patientSetting) {
                p.patientSetting = patientSetting;
            }
        }

        if (result[this.name("birthday")]) {
            p.birthday = result[this.name("birthday")];
        }

        if (result[this.name("info")]) {
            p.info = result[this.name("info")];
        }

        return p;
    }

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
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
     * Creates the joins for the patient-facade and returns them as a list.
     */
    get joins(): SQLJoin[] {
        const joins: SQLJoin[] = [];

        if (this._withUserJoin) {
            const userJoin: SQLBlock = new SQLBlock();
            userJoin.addText(`${this.tableAlias}.patient_id = ${this._userFacade.tableAlias}.id`);
            joins.push(
                new SQLJoin(this._userFacade.tableName, this._userFacade.tableAlias, userJoin,
                    JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE)
            );
        }

        if (this._withPatientSettingsJoin) {
            const patientSettingsJoin: SQLBlock = new SQLBlock();
            patientSettingsJoin.addText(`${this.tableAlias}.id = ${this._patientSettingsFacade.tableAlias}.patient_id`);
            joins.push(
                new SQLJoin(
                    this._patientSettingsFacade.tableName,
                    this._patientSettingsFacade.tableAlias,
                    patientSettingsJoin,
                    JoinType.LEFT_JOIN, JoinCardinality.ONE_TO_ONE)
            );
        }

        return joins;
    }

    /**
     * Returns all sub-facade filters of the facade as an array.
     */
    protected get filters(): Filter[] {
        return [
            this.userFacadeFilter,
            this.patientSettingsFilter
        ];
    }

    get userFacadeFilter(): Filter {
        return this._userFacade.filter;
    }

    get patientSettingsFilter(): Filter {
        return this._patientSettingsFacade.filter;
    }

    /**
     * returns all sub-facade order-bys of the facade as an array.
     */
    protected get orderBys(): Ordering[] {
        return [
            this.userFacadeOrderBy,
            this.patientSettingsFacadeOrderBy
        ];
    }

    get userFacadeOrderBy(): Ordering {
        return this._userFacade.ordering;
    }

    get patientSettingsFacadeOrderBy(): Ordering {
        return this._patientSettingsFacade.ordering;
    }

    get withUserJoin(): boolean {
        return this._withUserJoin;
    }

    set withUserJoin(value: boolean) {
        this._withUserJoin = value;
    }

    get withPatientSettingsJoin(): boolean {
        return this._withPatientSettingsJoin;
    }

    set withPatientSettingsJoin(value: boolean) {
        this._withPatientSettingsJoin = value;
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
