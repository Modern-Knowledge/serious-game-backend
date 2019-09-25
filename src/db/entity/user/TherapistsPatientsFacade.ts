import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { TherapistPatient } from "../../../lib/models/TherapistPatient";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import logger from "../../../util/logger";
import { SQLComparisonOperator } from "../../../db/sql/SQLComparisonOperator";
import { SQLOperator } from "../../../db/sql/enums/SQLOperator";

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
   * returns sql attributes that should be retrieved from the database
   * @param excludedSQLAttributes attributes that should not be selected
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] = ["therapist_id", "patient_id"];
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

  /**
   * inserts a new therapist-patient and returns the created therapist-patient
   * @param therapistPatient TherapistPatient to insert
   */
  public async insertTherapistPatient(
    therapistPatient: TherapistPatient
  ): Promise<TherapistPatient> {
    const attributes: SQLValueAttributes = this.getSQLValueAttributes(
      this.tableName,
      therapistPatient
    );
    return new Promise<TherapistPatient>((resolve, reject) => {
      this.insert(attributes).then(id => {
        resolve(therapistPatient);
      });
    });
  }
  /**
   * delete patients that are not in the given entity
   * @param therapistPatients entities to take the ids values from
   */
  public async syncPatients(therapistPatient: TherapistPatient) {
    const filter = this.filter;
    filter.addFilterCondition(
      "therapist_id",
      therapistPatient.therapistId,
      SQLComparisonOperator.EQUAL
    );
    return await this.delete([this]);
  }

  /**
   * return common sql attributes for insert and update statement
   * @param prefix prefix before the sql attribute
   * @param therapistPatient entity to take values from
   */
  protected getSQLValueAttributes(
    prefix: string,
    therapistPatient: TherapistPatient
  ): SQLValueAttributes {
    const attributes: SQLValueAttributes = new SQLValueAttributes();

    const therapistIdAttribute: SQLValueAttribute = new SQLValueAttribute(
      "therapist_id",
      prefix,
      therapistPatient.therapistId
    );
    attributes.addAttribute(therapistIdAttribute);

    const patientIdAttribute: SQLValueAttribute = new SQLValueAttribute(
      "patient_id",
      prefix,
      therapistPatient.patientId
    );
    attributes.addAttribute(patientIdAttribute);

    return attributes;
  }
}
