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
    const sqlAttributes: string[] =  ["therapist_id", "patient_id"];
    let exclDefaultAttr: string[] = ["id", "created_at", "modified_at"];

    if (excludedSQLAttributes) {
      exclDefaultAttr = exclDefaultAttr.concat(excludedSQLAttributes);
    }

    return super.getSQLAttributes(exclDefaultAttr, sqlAttributes);
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  protected fillEntity(result: any): TherapistPatient {
    const therapistPatient: TherapistPatient = new TherapistPatient();

    if (result[this.name("therapist_id")] !== undefined) {
      therapistPatient.therapistId = result[this.name("therapist_id")];
    }

    if (result[this.name("patient_id")] !== undefined) {
      therapistPatient.patientId = result[this.name("patient_id")];
    }

    return therapistPatient;
  }

}
