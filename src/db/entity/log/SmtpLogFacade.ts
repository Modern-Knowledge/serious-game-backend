
import { SmtpLog } from "../../../lib/models/SmtpLog";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * Handles CRUD operations with the smtp-logs.
 */
export class SmtpLogFacade extends EntityFacade<SmtpLog> {

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("smtp_logs", tableAlias);
        } else {
            super("smtp_logs", "smtpl");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["subject", "body", "rcpt_email", "simulated", "sent"];
        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * Inserts a new smtp-log and returns the created smtp-log.
     *
     * @param smtpLog log to insert
     */
    public async insert(smtpLog: SmtpLog): Promise<SmtpLog> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(smtpLog);
        await this.insertStatement(attributes);
        return smtpLog;
    }

    /**
     * Deletes the specified smtp-logs and returns the number of deleted rows.
     */
    public delete(): Promise<number> {
        return this.deleteStatement();
    }

    /**
     * Fills the smtp-log-entity from the result.
     *
     * @param result database results
     */
    public fillEntity(result: any): SmtpLog {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const smtpLog: SmtpLog = new SmtpLog();

        this.fillDefaultAttributes(result, smtpLog);

        if (result[this.name("subject")]) {
            smtpLog.subject = result[this.name("subject")];
        }

        if (result[this.name("body")]) {
            smtpLog.body = result[this.name("body")];
        }

        if (result[this.name("rcpt_email")]) {
            smtpLog.rcptEmail = result[this.name("rcpt_email")];
        }

        if (result[this.name("simulated")] !== undefined) {
            smtpLog.simulated = result[this.name("simulated")];
        }

        if (result[this.name("sent")] !== undefined) {
            smtpLog.sent = result[this.name("sent")];
        }

        return smtpLog;
    }

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param smtpLog entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, smtpLog: SmtpLog): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const logSubject: SQLValueAttribute = new SQLValueAttribute("subject", prefix, smtpLog.subject);
        attributes.addAttribute(logSubject);

        const logBody: SQLValueAttribute = new SQLValueAttribute("body", prefix, smtpLog.body);
        attributes.addAttribute(logBody);

        const logRcptMail: SQLValueAttribute = new SQLValueAttribute("rcpt_email", prefix, smtpLog.rcptEmail);
        attributes.addAttribute(logRcptMail);

        const logSimulated: SQLValueAttribute = new SQLValueAttribute("simulated", prefix, smtpLog.simulated);
        attributes.addAttribute(logSimulated);

        const logSent: SQLValueAttribute = new SQLValueAttribute("sent", prefix, smtpLog.sent);
        attributes.addAttribute(logSent);

        return attributes;
    }

}
