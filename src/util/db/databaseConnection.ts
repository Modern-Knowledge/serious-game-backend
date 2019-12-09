
import mysql, { MysqlError, Pool, PoolConnection } from "mysql";
import { SQLValueAttributes } from "../../db/sql/SQLValueAttributes";
import { inTestMode, loggerString } from "../Helper";
import logger from "../log/logger";

/**
 * Interface that defines queries that can used in a transaction.
 *
 * function: Represents insert-, update- or delete-queries that are executed in a transaction.
 * attributes: SqlValueAttributes that are injected into the insert or update query.
 * callBackOnInsert: Callback that is executed, if the query returns an inserted id.
 */
export interface ITransactionQuery {
    function: ((connection: PoolConnection, attributes?: SQLValueAttributes) => Promise<any>);
    attributes?: SQLValueAttributes;
    callBackOnInsert?: (insertId: number, attributes: SQLValueAttributes) => void;
}

/**
 * Handles the connection to the database. Creates a pool of mysql-connections and manages
 * the retrieval of the connections. Queries can be executed in a transaction with a rollback,
 * if an error occurs while querying the database.
 */
class DatabaseConnection {
    private _pool: Pool;

    public constructor() {
        logger.info(`${loggerString(__dirname, DatabaseConnection.name, "constructor")} ` +
            `DatabaseConnection instance was created!`);
        this.connect();
        this.createPoolEvents();
    }

    /**
     * Retrieves a mysql connection from the pool and executes the callback.
     *
     * @param callback callback to execute if connection is retrieved
     */
    public poolQuery(callback: (err: MysqlError, connection: PoolConnection) => void): void {
        this._pool.getConnection(callback);
    }

    /**
     * Execute the array of queries in a transaction. If a query fails, then the changes of all queries are reverted.
     * Queries can be of type insert, update, delete. Returns the responses of the queries as an array.
     * If the query is an insert-query, a callback can be passed that is executed with the current results.
     * e.g.: Used to set the inserted id for the next query.
     * The callback if the last query is not executed.
     *
     * @param queryCallbacks array of queries that are executed in the transaction
     */
    // tslint:disable-next-line:cognitive-complexity
    public transaction(queryCallbacks: ITransactionQuery[]): Promise<any[]> {
        logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "transaction")} ` +
            `${queryCallbacks.length} ${queryCallbacks.length === 1 ? "query is" : "queries are"} ` +
            `going to be executed in a transaction!`);

        return new Promise<any[]>((resolve, reject) => {
            this.poolQuery((error: MysqlError, connection: PoolConnection) => {
                if (error) { // error with pool
                    if (connection) {
                        connection.release();
                    }
                    logger.error(`${loggerString(__dirname, DatabaseConnection.name, "transaction")} `
                        + `${error.message}`);
                    return reject(error);
                }

                /**
                 * begin transaction
                 */
                connection.beginTransaction(async (mysqlError: MysqlError) => {
                    logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "transaction")} `
                        + `Begin transaction!`);

                    if (mysqlError) { // error with starting transaction
                        connection.release();
                        logger.error(`${loggerString(__dirname, DatabaseConnection.name, "transaction")} `
                            + `${mysqlError.message}`);

                        return reject(mysqlError);
                    }

                    const result: any[]  = [];

                    let response;

                    /**
                     * execute the queries in a transaction
                     */
                    for (let i = 0; i < queryCallbacks.length; i++) {
                        response = await queryCallbacks[i].function(connection, queryCallbacks[i].attributes);

                        if (response && response.insertedId &&
                            i < queryCallbacks.length - 1 && queryCallbacks[i].callBackOnInsert) { // insert query

                                queryCallbacks[i].callBackOnInsert(
                                    response.insertedId,
                                    queryCallbacks[i + 1].attributes
                                ); // execute callback with attributes of next element
                        }

                        result.push(response);
                    }

                    /**
                     * commit transaction
                     */
                    connection.commit((mysqlError1: MysqlError) => {
                        if (mysqlError1) { // error when committing
                            return connection.rollback(() => {
                                connection.release();

                                logger.error(`${loggerString(
                                    __dirname,
                                    DatabaseConnection.name,
                                    "transaction")} Transaction changes are rollbacked!`);

                                logger.error(`${loggerString(
                                    __dirname,
                                    DatabaseConnection.name,
                                    "transaction")} ${mysqlError1.message}`);

                                return reject(mysqlError1);
                            });
                        }
                        connection.release();
                        logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "transaction")} `
                            + `Transaction was executed successful!`);

                        return resolve(result);
                    });
                });
            });
        });
    }

    /**
     * Execute a sql-query and returns the results as an array. Takes a connection
     * from the pool and releases it afterwards. If an error occurs while executing the
     * query the function throws an error.
     *
     * @param sql sql query to be executed
     * @param params parameters for prepared query that are later replaced
     */
    public query(sql: string, params: any[] = []): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            databaseConnection.poolQuery((error: MysqlError, connection: PoolConnection) => {
                if (error) {
                    if (connection) {
                        connection.release();
                    }
                    logger.error(`${loggerString(__dirname, DatabaseConnection.name, "query")} `
                        + `${error.message}`);
                    return reject(error);
                }

                const query = connection.query(sql, params, (mysqlError: MysqlError, results) => {
                    connection.release(); // release pool connection

                    logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "query")} ` +
                        `${query.sql} [${query.values}]`);

                    if (mysqlError) {
                        logger.error(`${loggerString(__dirname, DatabaseConnection.name, "query")} `
                            + `${mysqlError.message}`);
                        return reject(mysqlError);
                    }

                    return resolve(results);
                });
            });
        });
    }

    /**
     * Pings the database and checks if it îs reachable. If the database
     * responds the function returns true. Otherwise it returns false.
     */
    public ping(): Promise<boolean> {
        logger.info(`${loggerString(__dirname, DatabaseConnection.name, "ping")} Pinging Database!`);
        return new Promise<boolean>((resolve, reject) => {
            databaseConnection.poolQuery((error: MysqlError, connection: PoolConnection) => {
                if (error) {
                    if (connection) {
                        connection.release();
                    }
                    logger.error(`${loggerString(__dirname, DatabaseConnection.name, "ping")} `
                        + `${error.message}`);
                    return reject(false);
                }

                connection.ping((connectionErr) => {
                    connection.release(); // release pool connection

                    if (connectionErr) {
                        logger.error(
                            `${loggerString(__dirname, DatabaseConnection.name, "ping")} ` +
                            `${connectionErr.message}`
                        );
                        return reject(false);
                    }

                    return resolve(true);
                });
            });
        });
    }

    /**
     * Establishes a connection pool from the database credentials. Credentials
     * depend on the current environment. If the application runs in test-mode,
     * the pool is created for the test-database. Otherwise the connection is made
     * to the productive database.
     */
    private connect(): void {
        if (inTestMode()) {
            logger.info(`${loggerString(__dirname, DatabaseConnection.name, "connect")} ` +
                `Connecting to Test-Database`);

            this._pool = mysql.createPool({
                connectionLimit: Number(process.env.DB_CONNECTION_LIMIT),
                database: process.env.TEST_DB_DATABASE,
                debug: false,
                host: process.env.TEST_DB_HOST,
                multipleStatements: true,
                password: process.env.TEST_DB_PASS,
                user: process.env.TEST_DB_USER,
                waitForConnections: true
            });
        } else {
            logger.info(`${loggerString(__dirname, DatabaseConnection.name, "connect")} ` +
                `Connecting to Productive-Database`);

            this._pool = mysql.createPool({
                connectionLimit: Number(process.env.DB_CONNECTION_LIMIT),
                database: process.env.DB_DATABASE,
                debug: false,
                host: process.env.DB_HOST,
                multipleStatements: true,
                password: process.env.DB_PASS,
                user: process.env.DB_USER,
                waitForConnections: true
            });
        }
    }

    /**
     * Creates events for the connection-pool. Events are executed, when a connection is taken from the pool, when a
     * new connection is created, when a connection is released and added back to the pool and when a client waits
     * for a connection.
     */
    private createPoolEvents(): void {
        this._pool.on("acquire", (connection) => {
            logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "createPoolEvents")} ` +
                `Connection ${connection.threadId} acquired!`);
        });

        this._pool.on("connection", () => {
            logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "createPoolEvents")} ` +
                `New Connection created!`);
        });

        this._pool.on("enqueue", () => {
            logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "createPoolEvents")} ` +
                `Waiting for available connection slot!`);
        });

        this._pool.on("release", (connection) => {
            logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "createPoolEvents")} ` +
                `Connection ${connection.threadId} released!`);
        });
    }

    /**
     * Closes the pool and disconnects every connection.
     */
    private disconnect(): void {
        this._pool.end((err: MysqlError) => {
            if (err) {
                logger.error(`${loggerString(__dirname, DatabaseConnection.name, "disconnect")} ` +
                    `${err.message} ${this}`);
                throw err;
            } else {
                logger.info(`${loggerString(__dirname, DatabaseConnection.name, "disconnect")} ` +
                    `Disconnected from database! ${this}`);
            }
        });
    }

}

const databaseConnection = new DatabaseConnection();
export { databaseConnection };
