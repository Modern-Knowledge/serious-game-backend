import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { Severity } from "../../../lib/models/Severity";

/**
 * handles CRUD operations with the severity-entity
 */
export class SeverityFacade extends EntityFacade<Severity> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("severities", tableAlias);
        } else {
            super("severities", "sev");
        }
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["severity"];

        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Severity {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const severity: Severity = new Severity();

        this.fillDefaultAttributes(result, severity);

        if (result[this.name("severity")]) {
            severity.severity = result[this.name("severity")];
        }

        return severity;
    }

}
