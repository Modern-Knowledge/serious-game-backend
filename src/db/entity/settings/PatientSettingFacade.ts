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
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["neglect", "patient_id"];

        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
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
