
import { TherapistPatient } from "../../../lib/models/TherapistPatient";
import { SQLComparisonOperator } from "../../sql/enums/SQLComparisonOperator";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * Handles CRUD operations with therapists-patients-entity.
 */
export class TherapistsPatientsFacade extends EntityFacade<TherapistPatient> {

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("therapists_patients", tableAlias);
        } else {
            super("therapists_patients", "thpa");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["therapist_id", "patient_id"];
        let exclDefaultAttr: string[] = ["id"];

        if (excludedSQLAttributes) {
            exclDefaultAttr = exclDefaultAttr.concat(excludedSQLAttributes);
        }

        return super.getSQLAttributes(exclDefaultAttr, sqlAttributes);
    }

    /**
     * Inserts a new therapist-patient and returns the created therapist-patient.
     *
     * @param therapistPatient TherapistPatient to insert
     */
    public async insert(therapistPatient: TherapistPatient): Promise<TherapistPatient> {
        const attributes: SQLValueAttributes = this.getSQLValueAttributes(
            this.tableName,
            therapistPatient
        );

        await this.insertStatement(attributes);

        return therapistPatient;
    }

    /**
     * Delete all patients from a therapist.
     *
     * @param therapistPatient entities to take the ids values from
     */
    public async syncPatients(therapistPatient: TherapistPatient) {
        const filter = this.filter;
        filter.addFilterCondition(
            "therapist_id",
            therapistPatient.therapistId,
            SQLComparisonOperator.EQUAL
        );
        return await this.deleteStatement([this]);
    }

    /**
     * Fills the therapist-patient-entity from the result.
     *
     * @param result database results
     */
    protected fillEntity(result: any): TherapistPatient {
        const therapistPatient: TherapistPatient = new TherapistPatient();

        if (result[this.name("therapist_id")]) {
            therapistPatient.therapistId = result[this.name("therapist_id")];
        }

        if (result[this.name("patient_id")]) {
            therapistPatient.patientId = result[this.name("patient_id")];
        }

        return therapistPatient;
    }

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
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
