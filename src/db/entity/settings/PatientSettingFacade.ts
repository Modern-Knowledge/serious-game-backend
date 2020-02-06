
import { PatientSetting } from "../../../lib/models/PatientSetting";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * Handles CRUD operations with patient-settings-entity.
 */
export class PatientSettingFacade extends EntityFacade<PatientSetting> {

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("patient_settings", tableAlias);
        } else {
            super("patient_settings", "ps");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["neglect", "patient_id"];

        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * Fills the patient-setting-entity from the result.
     *
     * @param result database results
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
     * Inserts a new patient-setting and returns the created patient-setting.
     *
     * @param patientSetting patientSetting that should be inserted
     */
    public async insert(patientSetting: PatientSetting): Promise<PatientSetting> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(patientSetting);

        const result = await this.insertStatement(attributes);

        if (result.length > 0) {
            patientSetting.id = result[0].insertedId;
        }

        return patientSetting;
    }

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param patientSetting entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, patientSetting: PatientSetting): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const patientIdAttribute: SQLValueAttribute
            = new SQLValueAttribute("patient_id", prefix, patientSetting.patientId);
        attributes.addAttribute(patientIdAttribute);

        const neglectAttribute: SQLValueAttribute
            = new SQLValueAttribute("neglect", prefix, patientSetting.neglect);
        attributes.addAttribute(neglectAttribute);

        return attributes;
    }

}
