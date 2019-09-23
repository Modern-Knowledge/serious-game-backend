import mysql, { Connection, MysqlError } from "mysql";
import logger from "./logger";
import moment from "moment";
import { loggerString } from "./Helper";

/**
 * handles database connection and database interaction
 */
class DatabaseConnection {
    private _connection: Connection;

    private readonly _host: string;
    private readonly _user: string;
    private readonly _password: string;
    private readonly _database: string;

    /**
     * @param host
     * @param user
     * @param password
     * @param database
     */
    public constructor(host: string, user: string, password: string, database: string) {
        logger.info(`${loggerString(__dirname, DatabaseConnection.name, "constructor")} DatabaseConnection instance was created!`);

        this._host = host;
        this._user = user;
        this._password = password;
        this._database = database;

        this.connect();
    }

    /**
     * establish connection to database
     */
    private connect(): void {
        this._connection = mysql.createConnection({host: this._host, user: this._user, password: this._password, database: this._database});
        this._connection.connect((err: MysqlError) => {
            if (err) {
                logger.error(`${loggerString(__dirname, DatabaseConnection.name, "connect")} ${err} ${this}`);
                throw err;
            } else {
                logger.info(`${loggerString(__dirname, DatabaseConnection.name, "connect")} Connected to database! ${this}`);
            }
        });
    }

    /**
     * disconnects from database
     */
    private disconnect(): void {
        this._connection.end((err: MysqlError) => {
            if (err) {
                logger.error(`${loggerString(__dirname, DatabaseConnection.name, "disconnect")} ${err} ${this}`);
                throw err;
            } else {
                logger.info(`${loggerString(__dirname, DatabaseConnection.name, "disconnect")} Disconnected from database! ${this}`);
            }
        });
    }

    /**
     * pings server
     */
    public ping(): string {
        this._connection.ping((err: MysqlError) => {
            if (err) {
                logger.error(`${loggerString(__dirname, DatabaseConnection.name, "ping")} ${err} ${this}`);
                throw err;
            } else {
                logger.info(`${loggerString(__dirname, DatabaseConnection.name, "ping")} Ping to ${this} was successful!`);
            }
        });

        return `Ping at ${moment().format("LLL")} to ${this} was successful!`;
    }

    public toString(): string {
        return `{host: ${this._host}, database: ${this._database}, user: ${this._user}}`;
    }

    get connection(): Connection {
        return this._connection;
    }
}

const databaseConnection = new DatabaseConnection(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS, process.env.DB_DATABASE);
export { databaseConnection };