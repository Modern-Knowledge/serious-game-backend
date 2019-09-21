/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SmtpMessage } from "../../../lib/models/SmtpMessage";

/**
 * handles CRUD operations with the smtp-category facade
 */
export class SmtpMessageFacade extends EntityFacade<SmtpMessage> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("smtp_messages", tableAlias);
        } else {
            super("smtp_messages", "smtpm");
        }
    }

    /**
     * returns SQL-attributes for the smtp_categories
     * @param excludedSQLAttributes sql attributes that are excluded from the query
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["name", "subject", "html", "text"];
        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }


    /**
     * assigns the retrieved values to the newly created smtp_category and returns the log
     * @param result retrieved result
     */
    public fillEntity(result: any): SmtpMessage {
        const sc: SmtpMessage = new SmtpMessage();

        this.fillDefaultAttributes(result, sc);

        if (result[this.name("name")] !== undefined) {
            sc.name = result[this.name("name")];
        }

        if (result[this.name("subject")] !== undefined) {
            sc.subject = result[this.name("subject")];
        }

        if (result[this.name("html")] !== undefined) {
            sc.html = result[this.name("html")];
        }

        if (result[this.name("text")] !== undefined) {
            sc.text = result[this.name("text")];
        }

        return sc;
    }

}