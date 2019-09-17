import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { TherapistPatient } from "../../../lib/models/TherapistPatient";

/**
 * handles CRUD operations with therapists-patients-entity
 */
export class TherapistsPatientsFacade extends EntityFacade<TherapistPatient> {

  /**
   * @param tableAlias
   */
  public constructor(tableAlias?: string) {

    if (tableAlias) {
      super("therapists_patients", tableAlias);
    } else {
      super("therapists_patients", "thpa");
    }
  }

  /**
   * returns SQL-attributes for therapists-patients
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] =  ["therapists_id", "patients_id"];
    let exclDefaultAttr: string[] = ["id", "created_at", "modified_at"];

    if (excludedSQLAttributes) {
      exclDefaultAttr = exclDefaultAttr.concat(excludedSQLAttributes);
    }

    return super.getSQLAttributes(exclDefaultAttr, sqlAttributes);
  }

  /**
   * returns therapists-patients that match the specified filter
   * @param excludedSQLAttributes
   */
  public getTherapistsPatients(excludedSQLAttributes?: string[]): Promise<TherapistPatient[]> {
    const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
    return this.select(attributes, this.getJoins());
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  protected fillEntity(result: any): TherapistPatient {
    const therapistPatient: TherapistPatient = new TherapistPatient();

    if (result[this.name("therapists_id")] !== undefined) {
      therapistPatient.therapists_id = result[this.name("therapists_id")];
    }

    if (result[this.name("patients_id")] !== undefined) {
      therapistPatient.patients_id = result[this.name("patients_id")];
    }

    return therapistPatient;
  }

}
