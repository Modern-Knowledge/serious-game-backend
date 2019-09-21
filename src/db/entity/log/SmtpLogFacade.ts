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
     * returns SQL-attributes for the smtp-logs
     * @param excludedSQLAttributes sql attributes that are excluded from the query
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["subject", "body", "rcpt_email", "simulated", "smtp_category_id"];
        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * inserts a new smtp-log and returns the id of the created smtp-log
     * @param smtpLog log to insert
     */
    public insertLog(smtpLog: SmtpLog): Promise<SmtpLog> {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const loggerAttribute: SQLValueAttribute = new SQLValueAttribute("subject", this.tableName, smtpLog.subject);
        attributes.addAttribute(loggerAttribute);

        const loggerLevel: SQLValueAttribute = new SQLValueAttribute("body", this.tableName, smtpLog.body);
        attributes.addAttribute(loggerLevel);

        const loggerMethod: SQLValueAttribute = new SQLValueAttribute("rcpt_email", this.tableName, smtpLog.rcptEmail);
        attributes.addAttribute(loggerMethod);

        const loggerMessage: SQLValueAttribute = new SQLValueAttribute("simulated", this.tableName, smtpLog.simulated);
        attributes.addAttribute(loggerMessage);

        const loggerParams: SQLValueAttribute = new SQLValueAttribute("smtp_category_id", this.tableName, smtpLog.smtpCategoryId);
        attributes.addAttribute(loggerParams);

        const createdAtDate: Date = new Date();
        const createdAtAttribute: SQLValueAttribute = new SQLValueAttribute("created_at", this.tableName, createdAtDate);
        attributes.addAttribute(createdAtAttribute);

        return new Promise<SmtpLog>((resolve, reject) => {
            this.insert(attributes).then(id => {
                if (id > 0) {
                    smtpLog.id = id;
                    smtpLog.createdAt = createdAtDate;
                    resolve(smtpLog);
                }
            });
        });
    }

    /**
     * assigns the retrieved values to the newly created smtp-log and returns the smtp-log
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

        if (result[this.name("smtp_category_id")] !== undefined) {
            smtpLog.smtpCategoryId = result[this.name("smtp_category_id")];
        }

        return smtpLog;
    }

}
