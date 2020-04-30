import { Log } from "serious-game-library/dist/models/Log";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * Handles CRUD operations with the log-entity.
 */
export class LogFacade extends EntityFacade<Log> {

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("logs", tableAlias);
        } else {
            super("logs", "l");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["logger", "level", "method", "message", "params", "user_id"];
        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * Inserts a new log and returns the created log.
     *
     * @param log log that should be inserted
     */
    public async insert(log: Log): Promise<Log> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(log);
        await this.insertStatement(attributes);
        return log;
    }

    /**
     * Deletes the specified logs and returns the number of deleted rows.
     */
    public delete(): Promise<number> {
        return this.deleteStatement();
    }

    /**
     * Fills the log-entity from the result.
     *
     * @param result database results
     */
    public fillEntity(result: any): Log {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const l: Log = new Log();

        this.fillDefaultAttributes(result, l);

        if (result[this.name("logger")]) {
            l.logger = result[this.name("logger")];
        }

        if (result[this.name("level")]) {
            l.level = result[this.name("level")];
        }

        if (result[this.name("method")]) {
            l.method = result[this.name("method")];
        }

        if (result[this.name("message")]) {
            l.message = result[this.name("message")];
        }

        if (result[this.name("params")]) {
            l.params = result[this.name("params")].split(" ");
        }

        if (result[this.name("user_id")]) {
            l.userId = result[this.name("user_id")];
        }

        return l;
    }

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param log entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, log: Log): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const loggerAttribute: SQLValueAttribute = new SQLValueAttribute("logger", prefix, log.logger);
        attributes.addAttribute(loggerAttribute);

        const loggerLevel: SQLValueAttribute = new SQLValueAttribute("level", prefix, log.level);
        attributes.addAttribute(loggerLevel);

        const loggerMethod: SQLValueAttribute = new SQLValueAttribute("method", prefix, log.method);
        attributes.addAttribute(loggerMethod);

        const loggerMessage: SQLValueAttribute = new SQLValueAttribute("message", prefix, log.message);
        attributes.addAttribute(loggerMessage);

        const loggerParams: SQLValueAttribute = new SQLValueAttribute("params", prefix, log.params.join(" "));
        attributes.addAttribute(loggerParams);

        const userIdParams: SQLValueAttribute = new SQLValueAttribute("user_id", prefix, log.userId);
        attributes.addAttribute(userIdParams);

        return attributes;
    }

}
