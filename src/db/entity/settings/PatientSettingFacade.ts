import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { PatientSetting } from "../../../lib/models/PatientSetting";

/**
 * handles CRUD operations with patient-settings-entity
 */
export class PatientSettingFacade extends EntityFacade<PatientSetting> {

  /**
   * @param tableAlias
   */
  public constructor(tableAlias?: string) {
    if (tableAlias) {
      super("patient_settings", tableAlias);
    } else {
      super("patient_settings", "ps");
    }
  }

  /**
   * returns SQL-attributes for the patient-settings
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] = ["neglect", "patient_id"];

    return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
  }

  /**
   * returns the patient-settings that match the specified filter
   * @param excludedSQLAttributes
   */
  public getPatientSettings(excludedSQLAttributes?: string[]): Promise<PatientSetting[]> {
    const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
    return this.select(attributes, this.getJoins());
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  public fillEntity(result: any): PatientSetting {
    const patientSetting: PatientSetting = new PatientSetting();

    this.fillDefaultAttributes(result, patientSetting);

    if (result[this.name("neglect")] !== undefined) {
      patientSetting.neglect = result[this.name("neglect")];
    }

    if (result[this.name("patient_id")] !== undefined) {
      patientSetting.patientId = result[this.name("patient_id")];
    }

    return patientSetting;
  }

}
