

import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { PatientSetting } from "../../../lib/models/PatientSetting";
import { Session } from "../../../lib/models/Session";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";

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
        if (!result[this.name("id")]) {
            return undefined;
        }

        const patientSetting: PatientSetting = new PatientSetting();

        this.fillDefaultAttributes(result, patientSetting);

        if (result[this.name("neglect")] !== undefined) {
            patientSetting.neglect = result[this.name("neglect")];
        }

        if (result[this.name("patient_id")]) {
            patientSetting.patientId = result[this.name("patient_id")];
        }

        return patientSetting;
    }


    /**
     * inserts a new session and returns the created session
     * @param patientSetting
     */
    public async insertPatientSetting(patientSetting: PatientSetting): Promise<PatientSetting> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(patientSetting);

        const result = await this.insert(attributes);

        if (result.length > 0) {
            patientSetting.id = result[0].insertedId;
        }

        return patientSetting;
    }

    /**
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
     * @param patientSetting entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, patientSetting: PatientSetting): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const patientIdAttribute: SQLValueAttribute = new SQLValueAttribute("patient_id", prefix, patientSetting.patientId);
        attributes.addAttribute(patientIdAttribute);

        const neglectAttribute: SQLValueAttribute = new SQLValueAttribute("neglect", prefix, patientSetting.neglect);
        attributes.addAttribute(neglectAttribute);

        return attributes;
    }

}
