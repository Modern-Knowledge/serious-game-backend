import { EntityFacade } from "../entity/EntityFacade";
import { Therapist } from "../../lib/models/Therapist";
import { TherapistFacade } from "../entity/user/TherapistFacade";
import { PatientFacade } from "../entity/user/PatientFacade";
import { SQLAttributes } from "../sql/SQLAttributes";
import { SQLJoin } from "../sql/SQLJoin";
import { SQLBlock } from "../sql/SQLBlock";
import { JoinType } from "../sql/JoinType";
import { TherapistsPatientsFacade } from "../entity/user/TherapistsPatientsFacade";
import { Patient } from "../../lib/models/Patient";

/**
 * retrieves therapists with associated patients
 */
export class TherapistCompositeFacade extends EntityFacade<Therapist> {

  private _therapistFacade: TherapistFacade = new TherapistFacade();
  private _patientFacade: PatientFacade = new PatientFacade();
  private _therapistPatientFacade: TherapistsPatientsFacade = new TherapistsPatientsFacade();

  public constructor() {
    super("therapists", "thera");
  }

  /**
   * @param excludedSQLAttributes
   * @param allowedSqlAttributes
   */
  public getSQLAttributes(excludedSQLAttributes?: string[], allowedSqlAttributes?: string[]): SQLAttributes {
    const returnAttributes: SQLAttributes = new SQLAttributes();

    returnAttributes.addSqlAttributes(this._therapistFacade.getSQLAttributes(excludedSQLAttributes));
    returnAttributes.addSqlAttributes(this._patientFacade.getSQLAttributes(excludedSQLAttributes));
    returnAttributes.addSqlAttributes(this._therapistPatientFacade.getSQLAttributes(excludedSQLAttributes));


    return returnAttributes;
  }

  /**
   * returns composite therapists that match the specified filter
   * @param excludedSQLAttributes
   */
  public getTherapists(excludedSQLAttributes?: string[]): Promise<Therapist[]> {
    const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
    return this.select(attributes, this.getJoins());
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  protected fillEntity(result: any): Therapist {
    const t: Therapist = this._therapistFacade.fillEntity(result);
    const p: Patient = this._patientFacade.fillEntity(result);

    t.addPatient(p);

    return t;
  }

  /**
   * creates the joins for the therapist-entity and returns them as a list
   */
  public getJoins(): SQLJoin[] {
    let joins: SQLJoin[] = [];

    joins = joins.concat(this._therapistFacade.getJoins()); // add therapist joins (user)
    joins = joins.concat(this._patientFacade.getJoins()); // add patient joins (user)

    const therapistPatientJoin: SQLBlock = new SQLBlock();
    therapistPatientJoin.addText(`${this._therapistFacade.tableAlias}.users_id = ${this._therapistPatientFacade.tableAlias}.therapists_id`);
    joins.push(new SQLJoin(this._therapistPatientFacade.tableName, this._therapistPatientFacade.tableAlias, therapistPatientJoin, JoinType.JOIN));

    const patientTherapistJoin: SQLBlock = new SQLBlock();
    patientTherapistJoin.addText(`${this._therapistPatientFacade.tableAlias}.patients_id = ${this._patientFacade.tableAlias}.users_id`);
    joins.push(new SQLJoin(this._patientFacade.tableName, this._patientFacade.tableAlias, patientTherapistJoin, JoinType.JOIN));


    return joins;
  }


  postProcessSelect(entities: Therapist[]): Therapist[] {
    return super.postProcessSelect(entities);
    // %todo
  }
}