/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SmtpLog } from "../../../lib/models/SmtpLog";

/**
 * handles CRUD operations with the smtp-logs
 */
export class SmtpLogFacade extends EntityFacade<SmtpLog> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("smtp_logs", tableAlias);
        } else {
            super("smtp_logs", "smtpl");
        }
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["subject", "body", "rcpt_email", "simulated", "smtp_category_id"];
        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * inserts a new smtp-log and sets the id of the created smtp-log
     * @param smtpLog log to insert
     */
    public insertLog(smtpLog: SmtpLog): SmtpLog {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(smtpLog);

        this.insert(attributes);

        return smtpLog;
    }

    /**
     * fills the entity
     * @param result retrieved result
     */
    public fillEntity(result: any): SmtpLog {
        const smtpLog: SmtpLog = new SmtpLog();

        this.fillDefaultAttributes(result, smtpLog);

        if (result[this.name("subject")] !== undefined) {
            smtpLog.subject = result[this.name("subject")];
        }

        if (result[this.name("body")] !== undefined) {
            smtpLog.body = result[this.name("body")];
        }

        if (result[this.name("rcpt_email")] !== undefined) {
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
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
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
