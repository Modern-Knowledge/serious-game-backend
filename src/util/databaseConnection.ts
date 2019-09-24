import mysql, { FieldInfo, MysqlError, Pool, PoolConnection, Query, queryCallback } from "mysql";
import logger from "./logger";
import { loggerString } from "./Helper";
import { SQLValueAttributes } from "../db/sql/SQLValueAttributes";

export interface TransactionQuery {
    function: ((connection: PoolConnection, attributes?: SQLValueAttributes) => Promise<number>);
    attributes?: SQLValueAttributes;
}

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
     * @param callback callback to execute if connection is retrieved
     */
    public poolQuery(callback: (err: MysqlError, connection: PoolConnection) => void): void {
        this._pool.getConnection(callback);
    }

    /**
     * executes the passed queries in a transactions
     * @param queryCallbacks array of queries that are executed in the transaction
     */
    public transaction(queryCallbacks: TransactionQuery[]): Promise<number> {
        logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "transaction")} ${queryCallbacks.length} queries are going to be executed in a transaction!`);

        return new Promise<number>((resolve, reject) => {
            this.poolQuery((error: MysqlError, connection: PoolConnection) => {
                if (error) {
                    logger.error(`${loggerString(__dirname, DatabaseConnection.name, "transaction")} ${error}`);
                    return reject(error);
                }

                /**
                 * begin transaction
                 */
                connection.beginTransaction(async (error: MysqlError) => {
                    logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "transaction")} Begin transaction!`);

                    if (error) {
                        logger.error(`${loggerString(__dirname, DatabaseConnection.name, "transaction")} ${error}`);
                        return reject(error);
                    }

                    let result = 0;

                    /**
                     * execute the queries in transaction
                     */
                    for (const item of queryCallbacks) {
                        result += await item.function(connection, item.attributes);
                    }

                    /**
                     * commit transaction
                     */
                    connection.commit((error: MysqlError) => {

                        if (error) {
                            return connection.rollback(() => {
                                logger.error(`${loggerString(__dirname, DatabaseConnection.name, "transaction")} Transaction changes are rollbacked!`);
                                logger.error(`${loggerString(__dirname, DatabaseConnection.name, "transaction")} ${error}`);
                                return reject(error);
                            });
                        }
                        logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "transaction")} Transaction was executed successful!`);

                        resolve(result);
                    });
                });
            });
        });
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