import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { Log } from "../../../lib/models/Log";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";

/**
 * handles CRUD operations with the log-entity
 */
export class LogFacade extends EntityFacade<Log> {

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("logs", tableAlias);
        } else {
            super("logs", "l");
        }
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["logger", "level", "method", "message", "params", "user_id"];

        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * inserts a new log and returns the id of the created log
     * @param log
     */
    public insertLog(log: Log): Log {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(log);

        this.insert(attributes).then(id => {
            log.id = id;
        });

        return log;
    }

    /**
     * fills the entity
     * @param result retrieved result
     */
    public fillEntity(result: any): Log {
        const l: Log = new Log();

        this.fillDefaultAttributes(result, l);

        if (result[this.name("logger")] !== undefined) {
            l.logger = result[this.name("logger")];
        }

        if (result[this.name("level")] !== undefined) {
            l.level = result[this.name("level")];
        }

        if (result[this.name("method")] !== undefined) {
            l.method = result[this.name("method")];
        }

        if (result[this.name("message")] !== undefined) {
            l.message = result[this.name("message")];
        }

        if (result[this.name("params")] !== undefined) {
            l.params = result[this.name("params")].split(" ");
        }

        if (result[this.name("user_id")] !== undefined) {
            l.userId = result[this.name("user_id")];
        }

        return l;
    }

    /**
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
     * @param log entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, log: Log): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const loggerAttribute: SQLValueAttribute = new SQLValueAttribute("logger", this.tableName, log.logger);
        attributes.addAttribute(loggerAttribute);

        const loggerLevel: SQLValueAttribute = new SQLValueAttribute("level", this.tableName, log.level);
        attributes.addAttribute(loggerLevel);

        const loggerMethod: SQLValueAttribute = new SQLValueAttribute("method", this.tableName, log.method);
        attributes.addAttribute(loggerMethod);

        const loggerMessage: SQLValueAttribute = new SQLValueAttribute("message", this.tableName, log.message);
        attributes.addAttribute(loggerMessage);

        const loggerParams: SQLValueAttribute = new SQLValueAttribute("params", this.tableName, log.params.join(" "));
        attributes.addAttribute(loggerParams);

        const userIdParams: SQLValueAttribute = new SQLValueAttribute("user_id", this.tableName, log.userId);
        attributes.addAttribute(userIdParams);

        return attributes;
    }

}
