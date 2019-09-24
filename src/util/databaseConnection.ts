import mysql, { MysqlError, Pool, PoolConnection } from "mysql";
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
            logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "createPoolEvents")} Connection ${connection.threadId} acquired`);
        });

        this._pool.on("connection", (connection) => {
            logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "createPoolEvents")} New Connection created!`);
        });

        this._pool.on("enqueue", () => {
            logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "createPoolEvents")} Waiting for available connection slot`);
        });

        this._pool.on("release", (connection) => {
            logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "createPoolEvents")} Connection ${connection.threadId} released`);
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

    public toString(): string {
        return `{host: ${process.env.DB_HOST}, database: ${process.env.DB_DATABASE}, user: ${process.env.DB_USER}}`;
    }

}

const databaseConnection = new DatabaseConnection();
export { databaseConnection };