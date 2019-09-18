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
     * returns SQL-attributes for the difficulties
     * @param excludedSQLAttributes sql attributes that are excluded from the query
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["severity"];

        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * returns difficulties that match the specified filter
     * @param excludedSQLAttributes
     */
    public getSeverities(excludedSQLAttributes?: string[]): Promise<Severity[]> {
        const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
        return this.select(attributes, this.getJoins());
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Severity {
        const severity: Severity = new Severity();

        this.fillDefaultAttributes(result, severity);

        if (result[this.name("severity")] !== undefined) {
            severity.severity = result[this.name("severity")];
        }

        return severity;
    }

}
