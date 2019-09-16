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

export class PatientFacade extends EntityFacade<Patient> {

  private userFacade: UserFacade = new UserFacade();

  public constructor() {
    super("patients", "p");
  }

  /**
   * returns SQL-attributes for the patient
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  protected getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] = ["users_id"];

    const userAttributes: SQLAttributes = this.userFacade.getSQLAttributes(excludedSQLAttributes);
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
    const t: User = await this.userFacade.insertUser(patient);

    const attributes: SQLValueAttributes = new SQLValueAttributes();

    const usersIdAttribute: SQLValueAttribute = new SQLValueAttribute("users_id", this.tableName, t.id);
    attributes.addAttribute(usersIdAttribute);

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

    const userRows: number = await this.userFacade.updateUser(patient);
    const patientRows: number = await this.update(attributes);

    return userRows + patientRows;
  }

  /**
   * deletes the specified therapist in the database and returns the number of affected rows
   * @param patient patient to delete
   */
  public async deletePatient(patient: Patient): Promise<number> {
    this._filter.addFilterAttribute(new FilterAttribute("users_id", patient.id, SQLComparisonOperator.EQUAL));
    const rows: number = await this.delete();

    const userRows: number = await this.userFacade.deleteUser(patient);

    return rows + userRows;
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  protected fillEntity(result: any): Patient {
    const p: Patient = new Patient();
    this.userFacade.fillUserEntity(result, p);

    if (result[this.name("birthday")] !== undefined) {
      p.birthday = result[this.name("birthday")];
    }

    if (result[this.name("info")] !== undefined) {
      p.info = result[this.name("info")];
    }

    if (result[this.name("patient_settings_id")] !== undefined) {
      p.patientSettingsId = result[this.name("patient_settings_id")];
    }

    return p;
  }

  /**
   * creates the joins for the therapist-entity and returns them as a list
   */
  public getJoins(): SQLJoin[] {
    const joins: SQLJoin[] = [];

    const userJoin: SQLBlock = new SQLBlock();
    userJoin.addText(`${this.tableAlias}.users_id = ${this.userFacade.tableAlias}.id`);
    joins.push(new SQLJoin(this.userFacade.tableName, this.userFacade.tableAlias, userJoin, JoinType.JOIN));

    return joins;
  }

  /**
   * returns the userFacadeFilter
   */
  public getUserFacadeFilter(): Filter {
    return this.userFacade.getFacadeFilter();
  }

}
