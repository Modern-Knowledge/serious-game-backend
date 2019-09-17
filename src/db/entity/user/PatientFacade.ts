import { UserFacade } from "./UserFacade";
import { User } from "../../../lib/models/User";
import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { FilterAttribute } from "../../filter/FilterAttribute";
import { SQLComparisonOperator } from "../../sql/SQLComparisonOperator";
import { SQLJoin } from "../../sql/SQLJoin";
import { JoinType } from "../../sql/JoinType";
import { SQLBlock } from "../../sql/SQLBlock";
import { Patient } from "../../../lib/models/Patient";
import { Filter } from "../../filter/Filter";

/**
 * handles crud operations with the patient-entity
 */
export class PatientFacade extends EntityFacade<Patient> {

  private _userFacade: UserFacade;

  public constructor(tableAlias?: string) {
    if (tableAlias) {
      super("patients", tableAlias);
    } else {
      super("patients", "p");
    }

    this._userFacade = new UserFacade("up");
  }

  /**
   * returns SQL-attributes for the patient
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] = ["patient_id", "birthday", "info"];

    const userAttributes: SQLAttributes = this._userFacade.getSQLAttributes(excludedSQLAttributes);
    const patientsAttributes: SQLAttributes = new SQLAttributes(this.tableAlias, sqlAttributes);
    patientsAttributes.addSqlAttributes(userAttributes);

    return patientsAttributes;
  }

  /**
   * returns therapists that match the specified filter
   * @param excludedSQLAttributes
   */
  public getPatients(excludedSQLAttributes?: string[]): Promise<Patient[]> {
    const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
    return this.select(attributes, this.getJoins());
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
    this._filter.addFilterAttribute(new FilterAttribute("patient_id", patient.id, SQLComparisonOperator.EQUAL));
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
    this._userFacade.fillUserEntity(result, p);

    if (result[this.name("birthday")] !== undefined) {
      p.birthday = result[this.name("birthday")];
    }

    if (result[this.name("info")] !== undefined) {
      p.info = result[this.name("info")];
    }

    return p;
  }

  /**
   * creates the joins for the therapist-entity and returns them as a list
   */
  public getJoins(): SQLJoin[] {
    const joins: SQLJoin[] = [];

    const userJoin: SQLBlock = new SQLBlock();
    userJoin.addText(`${this.tableAlias}.patient_id = ${this._userFacade.tableAlias}.id`);
    joins.push(new SQLJoin(this._userFacade.tableName, this._userFacade.tableAlias, userJoin, JoinType.JOIN));

    return joins;
  }

  /**
   * returns the userFacadeFilter
   */
  public getUserFacadeFilter(): Filter {
    return this._userFacade.getFacadeFilter();
  }

}
