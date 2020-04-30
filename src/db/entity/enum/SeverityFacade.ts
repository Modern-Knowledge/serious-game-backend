
import { Severity } from "serious-game-library/dist/models/Severity";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * Handles CRUD operations with the severity-entity.
 */
export class SeverityFacade extends EntityFacade<Severity> {

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("severities", tableAlias);
        } else {
            super("severities", "sev");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["severity"];

        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * Inserts a new severity and returns the created severity.
     *
     * @param severity severity to insert
     */
    public async insert(severity: Severity): Promise<Severity> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(severity);
        const result = await this.insertStatement(attributes);

        if (result.length > 0) {
            severity.id = result[0].insertedId;
        }

        return severity;
    }

    /**
     * Fills the severity-entity from the result.
     *
     * @param result database-results
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
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param severity entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, severity: Severity): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const severityAttribute: SQLValueAttribute = new SQLValueAttribute("severity", prefix, severity.severity);
        attributes.addAttribute(severityAttribute);

        return attributes;
    }

}
