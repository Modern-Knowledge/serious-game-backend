/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import mysql, { FieldInfo, MysqlError, Pool, PoolConnection, Query, queryCallback } from "mysql";
import logger from "../log/logger";
import { loggerString } from "../Helper";
import { SQLValueAttributes } from "../../db/sql/SQLValueAttributes";

/**
 * interface that defines queries that can used in a transaction
 * function: executes insert, update or delete query (getInsertQueryFn, getUpdateQueryFn, getDeleteQueryFn in BaseFacade are examples for functions that can be passed)
 * attributes: sqlvalueAttributes that are injected into the insert or update query
 * callBackOnInsert: callback that is called, if the query returns a insertId. The function is called with the returned inserted id. Used to set id
 */
export interface TransactionQuery {
    function: ((connection: PoolConnection, attributes?: SQLValueAttributes) => Promise<any>);
    attributes?: SQLValueAttributes;
    callBackOnInsert?: (insertId: number, attributes: SQLValueAttributes) => void;
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
     * executes the passed queries in a transaction
     * queries can be of type insert, update, delete
     * @param queryCallbacks array of queries that are executed in the transaction
     */
    public transaction(queryCallbacks: TransactionQuery[]): Promise<any[]> {
        logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "transaction")} ${queryCallbacks.length} ${queryCallbacks.length === 1 ? "query is" : "queries are"} going to be executed in a transaction!`);

        return new Promise<any[]>((resolve, reject) => {
            this.poolQuery((error: MysqlError, connection: PoolConnection) => {
                if (error) { // error with pool
                    logger.error(`${loggerString(__dirname, DatabaseConnection.name, "transaction")} ${error}`);
                    return reject(error);
                }

                /**
                 * begin transaction
                 */
                connection.beginTransaction(async (error: MysqlError) => {
                    logger.debug(`${loggerString(__dirname, DatabaseConnection.name, "transaction")} Begin transaction!`);

                    if (error) { // error with starting transaction
                        logger.error(`${loggerString(__dirname, DatabaseConnection.name, "transaction")} ${error}`);
                        return reject(error);
                    }

                    const result: any[]  = [];

                    let response = undefined;
                    /**
                     * execute the queries in a transaction
                     */
                    for (let i = 0; i < queryCallbacks.length; i++) {
                        response = await queryCallbacks[i].function(connection, queryCallbacks[i].attributes);

                        if (response && response.insertedId && i < queryCallbacks.length - 1) { // query was insert query
                            if (queryCallbacks[i].callBackOnInsert) {
                                queryCallbacks[i].callBackOnInsert(response.insertedId, queryCallbacks[i + 1].attributes); // execute callback with attributes of next element
                            }
                        }

                        result.push(response);
                    }

                    /**
                     * commit transaction
                     */
                    connection.commit((error: MysqlError) => {
                        connection.release();
                        if (error) { // error when committing
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