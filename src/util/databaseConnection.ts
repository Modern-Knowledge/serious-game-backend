import mysql, {FieldInfo, MysqlError, Pool, PoolConnection} from "mysql";
import logger from "./logger";
import { loggerString } from "./Helper";

/**
 * handles database connection and database interaction
 */
class DatabaseConnection {
    private _pool: Pool;

    public constructor() {
        logger.info(`${loggerString(__dirname, DatabaseConnection.name, "constructor")} DatabaseConnection instance was created!`);
        this.connect();
        this.createPoolEvents();
    }

    /**
     * establish pool connection to database
     */
    private connect(): void {
        this._pool = mysql.createPool({
            connectionLimit: 10,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE,
            debug: false,
            waitForConnections: true
        });
    }

    /**
     * create events for pool connection
     */
    private createPoolEvents(): void {
        this._pool.on("acquire", (connection) => {
            logger.info(`${loggerString(__dirname, DatabaseConnection.name, "createPoolEvents")} Connection ${connection.threadId} acquired!`);
        });

        this._pool.on("connection", (connection) => {
            logger.info(`${loggerString(__dirname, DatabaseConnection.name, "createPoolEvents")} New Connection created!`);
        });

        this._pool.on("enqueue", () => {
            logger.info(`${loggerString(__dirname, DatabaseConnection.name, "createPoolEvents")} Waiting for available connection slot!`);
        });

        this._pool.on("release", (connection) => {
            logger.info(`${loggerString(__dirname, DatabaseConnection.name, "createPoolEvents")} Connection ${connection.threadId} released!`);
        });
    }

    /**
     * close all connections in a pool
     */
    private disconnect(): void {
        this._pool.end((err: MysqlError) => {
            if (err) {
                logger.error(`${loggerString(__dirname, DatabaseConnection.name, "disconnect")} ${err} ${this}`);
                throw err;
            } else {
                logger.info(`${loggerString(__dirname, DatabaseConnection.name, "disconnect")} Disconnected from database! ${this}`);
            }
        });
    }

    /**
     * retrieves a connection from the pool and executes the callback
     * @param callback
     */
    public poolQuery(callback: (err: MysqlError, connection: PoolConnection) => void): void {
        this._pool.getConnection(callback);
    }

    public beginTransaction(callback: (err: MysqlError) => void): void {

    }

    /**
     * execute a sql query
     * @param sql sql query to be executed
     * @param params parameters for prepared query that are later replaced
     */
    public query(sql: string, params: string[] = []): Promise<any[]> {
        const returnArr: any[] = [];
        return new Promise<any[]>((resolve, reject) => {
            databaseConnection.poolQuery((error: MysqlError, connection: PoolConnection) => {
                if (error) {
                    logger.error(`${loggerString(__dirname, DatabaseConnection.name, "query")} ${error}`);
                    reject(error);
                }

                const query = connection.query(sql, params, (error: MysqlError, results, fields: FieldInfo[]) => {
                    connection.release(); // release pool connection

                    logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "query")} ${query.sql} [${query.values}]`);

                    if (error) {
                        logger.error(`${loggerString(__dirname, DatabaseConnection.name, "query")} ${error}`);
                        reject(error);
                    }

                    for (const item of results) {
                        returnArr.push(item);
                    }

                    resolve(returnArr);
                });
            });
        });
    }

    public toString(): string {
        return `{host: ${process.env.DB_HOST}, database: ${process.env.DB_DATABASE}, user: ${process.env.DB_USER}}`;
    }

}

const databaseConnection = new DatabaseConnection();
export { databaseConnection };