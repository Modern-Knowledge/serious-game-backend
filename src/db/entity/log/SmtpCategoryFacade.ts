/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { EntityFacade } from "../EntityFacade";
import { SmtpCategory } from "../../../lib/models/SmtpCategory";
import { SQLAttributes } from "../../sql/SQLAttributes";

/**
 * handles CRUD operations with the smtp-category facade
 */
export class SmtpCategoryFacade extends EntityFacade<SmtpCategory> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("smtp_categories", tableAlias);
        } else {
            super("smtp_categories", "smtpc");
        }
    }

    /**
     * returns SQL-attributes for the smtp_categories
     * @param excludedSQLAttributes sql attributes that are excluded from the query
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["name"];
        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }


    /**
     * assigns the retrieved values to the newly created smtp_category and returns the log
     * @param result retrieved result
     */
    public fillEntity(result: any): SmtpCategory {
        const sc: SmtpCategory = new SmtpCategory();

        this.fillDefaultAttributes(result, sc);

        if (result[this.name("category")] !== undefined) {
            sc.category = result[this.name("category")];
        }

        return sc;
    }

}