
import { Severity } from "../../../lib/models/Severity";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

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
     * inserts a new severity and returns the created severity
     * @param severity
     */
    public async insertSeverity(severity: Severity): Promise<Severity> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(severity);
        const result = await this.insert(attributes);

        if (result.length > 0) {
            severity.id = result[0].insertedId;
        }

        return severity;
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

    /**
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
     * @param severity entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, severity: Severity): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const severityAttribute: SQLValueAttribute = new SQLValueAttribute("severity", prefix, severity.severity);
        attributes.addAttribute(severityAttribute);

        return attributes;
    }

}
