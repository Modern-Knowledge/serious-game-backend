
import { MysqlError, PoolConnection } from "mysql";
import { Error } from "tslint/lib/error";
import { AbstractModel } from "../lib/models/AbstractModel";
import { ExecutionTimeAnalyser } from "../util/analysis/ExecutionTimeAnalyser";
import { Stopwatch } from "../util/analysis/Stopwatch";
import { databaseConnection, ITransactionQuery } from "../util/db/databaseConnection";
import { loggerString } from "../util/Helper";
import logger from "../util/log/logger";
import { Filter } from "./filter/Filter";
import { Ordering } from "./order/Ordering";
import { BakedQuery } from "./sql/BakedQuery";
import { DeleteQuery } from "./sql/DeleteQuery";
import { JoinCardinality } from "./sql/enums/JoinCardinality";
import { JoinType } from "./sql/enums/JoinType";
import { SQLOrder } from "./sql/enums/SQLOrder";
import { InsertQuery } from "./sql/InsertQuery";
import { SelectQuery } from "./sql/SelectQuery";
import { SQLAttributes } from "./sql/SQLAttributes";
import { SQLDelete } from "./sql/SQLDelete";
import { SQLFrom } from "./sql/SQLFrom";
import { SQLInsert } from "./sql/SQLInsert";
import { SQLJoin } from "./sql/SQLJoin";
import { SQLSelect } from "./sql/SQLSelect";
import { SQLUpdate } from "./sql/SQLUpdate";
import { SQLValueAttribute } from "./sql/SQLValueAttribute";
import { SQLValueAttributes } from "./sql/SQLValueAttributes";
import { SQLWhere } from "./sql/SQLWhere";
import { UpdateQuery } from "./sql/UpdateQuery";
import { WritableFacade } from "./WritableFacade";

/**
 * Base class for crud operations with the database.
 */
export abstract class BaseFacade<EntityType extends AbstractModel<EntityType>> extends WritableFacade<EntityType> {

    /**
     * Combine the joins of the different sub-facades and returns them as a list.
     */
    protected get joins(): SQLJoin[] {
        return [];
    }

    /**
     * Sets the filter of the facade.
     *
     * @param filter filter that should be set for the facade
     */
    set filter(filter: Filter) {
        this._filter = filter;
    }

    /**
     * Retrieves the filter for the facade.
     */
    get filter(): Filter {
        return this._filter;
    }

    /**
     * Returns the complete ordering of the facade (order-by).
     */
    get ordering(): Ordering {
        return this._ordering;
    }

    /**
     * Sets the ordering of the facade (order-by).
     *
     * @param value new order-bys of the facade
     */
    set ordering(value: Ordering) {
        this._ordering = value;
    }

    get tableName(): string {
        return this._tableName;
    }

    set tableName(value: string) {
        this._tableName = value;
    }

    get tableAlias(): string {
        return this._tableAlias;
    }

    set tableAlias(value: string) {
        this._tableAlias = value;
    }

    get attributes(): string[] {
        return this._attributes;
    }

    set attributes(value: string[]) {
        this._attributes = value;
    }

    /**
     * Sets the function that is applied to the result set of a select query.
     * Can be used to filter results, which is not possible in sql.
     *
     * @param value function that takes an array of entity types
     */
    set postProcessFilter(value: (entities: EntityType[]) => EntityType[]) {
        this._postProcessFilter = value;
    }

    /**
     * Creates a sql-where clause from the given filter.
     * @param filter filter to create the where clause from
     */
    private static getSQLFilter(filter: Filter): SQLWhere {
        return filter.isEmpty ? undefined : new SQLWhere(filter.getBlock());
    }

    private _tableName: string;
    private _tableAlias: string;
    private _attributes: string[];

    private _ordering: Ordering;
    private _filter: Filter;

    /**
     * @param tableName table-name of the facade
     * @param tableAlias table-alias of the facade
     */
    protected constructor(tableName: string, tableAlias: string) {
        super();
        this._tableName = tableName;
        this._tableAlias = tableAlias;

        this._filter = new Filter(tableAlias);
        this._ordering = new Ordering(tableAlias);
    }

    /**
     * Add an order-by clause.
     *
     * @param attribute attribute for ordering
     * @param order attribute sort order (ASC|DESC)
     */
    public addOrderBy(attribute: string, order: SQLOrder = SQLOrder.DESC): void {
        this.ordering.addOrderBy(attribute, order);
    }

    /**
     * Clear filter. Completly empties the filter.
     */
    public clearFilter(): void {
        this._filter.clear();
    }

    /**
     * Returns the fully qualified name (columnName + tableAlias) of a column.
     * Is used to identify the column in a result set.
     *
     * @param column name of the column
     */
    protected name(column: string): string {
        return column + this._tableAlias;
    }

    /**
     * Returns sql-columns that should be retrieved from the database.
     * Every table has default columns like id, created_at, modified_at.
     * Additional columns can be passed that are specific to the table.
     * Furthermore columns can be excluded to reduce the result set.
     *
     * @param excludedSQLAttributes attributes that should be excluded from the select query
     * @param allowedSqlAttributes attributes that should be included in the function
     */
    protected getSQLAttributes(excludedSQLAttributes?: string[], allowedSqlAttributes?: string[]): SQLAttributes {
        let sqlAttributes: string[] = ["id", "created_at", "modified_at"];

        // combine sql attributes
        sqlAttributes = sqlAttributes.concat(allowedSqlAttributes);

        // filter excluded sql attributes
        if (excludedSQLAttributes) {
            sqlAttributes = sqlAttributes.filter((x: string) => {
                return excludedSQLAttributes.indexOf(x) < 0;
            });
        }

        return new SQLAttributes(this.tableAlias, sqlAttributes);
    }

    /**
     * Executes an select query and returns the results as an array.
     * Result rows are converted to an instance of the current entity.
     * Execution time of the query is analysed and printed to the console
     * if it exceeds certain limits, that defined in the .env.
     *
     * @param attributes attributes that should be retrieved
     * @param filter filter for selected (can be different from facade filter)
     */
    // tslint:disable-next-line:cognitive-complexity
    protected select(attributes: SQLAttributes, filter: Filter): Promise<EntityType[]> {
        this.joinAnalyzer();

        const npq: IQuery = this.getSelectQuery(attributes, filter);

        let returnEntities: EntityType[] = [];

        const s: Stopwatch = new Stopwatch();
        return new Promise<EntityType[]>((resolve, reject) => {
            databaseConnection.poolQuery((error: MysqlError, connection: PoolConnection) => {
                if (error) {
                    if (connection) {
                        connection.release(); // release pool connection
                    }

                    logger.error(`${loggerString(__dirname, BaseFacade.name, "select")} ` +
                        `${error.message}`);
                    return reject(error);
                }

                const query = connection.query(npq.query, npq.params,
                    (mysqlError: MysqlError, results: any) => {
                    connection.release(); // release pool connection

                    logger.debug(`${loggerString(__dirname, BaseFacade.name, "select")} ` +
                        `${query.sql} [${query.values}]`);

                    if (mysqlError) {
                        logger.error(`${loggerString(__dirname, BaseFacade.name, "select")} ` +
                            `${mysqlError.message}`);
                        return reject(mysqlError);
                    }

                    for (const item of results) {
                        const entity: EntityType = this.fillEntity(item);
                        if (entity) {
                            returnEntities.push(entity);
                        }
                    }

                    returnEntities = this.postProcessSelect(returnEntities);
                    returnEntities = this._postProcessFilter(returnEntities);

                    logger.debug(`${loggerString(__dirname, BaseFacade.name, "select")} `
                        + `${returnEntities.length} result(s) returned!`);

                    if (returnEntities.length > 100) {
                        logger.info(`${loggerString(__dirname, BaseFacade.name, "select")} ` +
                        `More than ${returnEntities.length} rows returned! ` +
                        `Consider using WHERE-clause to shrink result set size`);
                    }

                    const elapsedTime = s.timeElapsed;
                    logger.debug(`${loggerString(__dirname, BaseFacade.name, "select")} ` +
                    `Results computed in ${elapsedTime}!`);

                    const eta: ExecutionTimeAnalyser = new ExecutionTimeAnalyser();
                    eta.analyse(s.measuredTime, BaseFacade.name + ".select");

                    return resolve(returnEntities);
                });
            });
        });
    }

    /**
     * Executes multiple insert queries and returns all inserted ids as an array.
     * Watch the order of the queries. Statements are executed in this order. If no
     * additional inserts are provided, than the insert-query of the of the current facade
     * with the passed attributes is executed. Otherwise the insert-queries of the passed facades are
     * executed with given entity in the specified order.
     *
     * - facade: facade to execute insert in
     * - entity: entity to insert
     * - callBackOnInsert: callback that is executed after the insert, last callback in array will not be executed
     *
     * @param attributes name-value pairs of attributes that should be inserted
     * @param additionalInserts queries to execute in the transaction
     */
    protected async insertStatement(
        attributes: SQLValueAttributes,
        additionalInserts?: Array<{facade: any, entity: EntityType, callBackOnInsert?: any}>):
        Promise<any[]> {

        // array of queries
        const funcArray: ITransactionQuery[] = [];
        if (additionalInserts) {
            for (const insert of additionalInserts) {
                const func: ITransactionQuery = {
                    attributes: insert.facade.getSQLInsertValueAttributes(insert.entity),
                    callBackOnInsert: insert.callBackOnInsert,
                    function: insert.facade.getInsertQueryFn
                };
                funcArray.push(func);
            }
        } else {
            funcArray.push({function: this.getInsertQueryFn, attributes});
        }

        return await databaseConnection.transaction(funcArray);
    }

    /**
     * Returns a function for executing an insert query.
     * Returned function can be executed to insert the specified row with the values.
     * Returned function executes one insert statement.
     *
     * @param connection database connection for the query
     * @param attributes attributes to take values for the insert
     */
    protected getInsertQueryFn: (connection: PoolConnection, attributes: SQLValueAttributes) => Promise<any> =
        (connection: PoolConnection, attributes: SQLValueAttributes) => {
        const npq: IQuery = this.getInsertQuery(attributes);

        return new Promise<any>((resolve, reject) => {
            const query = connection.query(npq.query, npq.params, (error: MysqlError, results) => {
                logger.debug(`${loggerString(__dirname, BaseFacade.name, "insert")} ${query.sql}`);

                if (error) {
                    logger.error(`${loggerString(__dirname, BaseFacade.name, "insert")} ` +
                        `${error.message}`);
                    return reject(error);
                }

                resolve({insertedId: results.insertId});
            });
        });
    };

    /**
     * Return attributes that are common to all inserts (created_at).
     *
     * @param entity entity to take values for the insert query from
     */
    protected getSQLInsertValueAttributes(entity: EntityType): SQLValueAttributes {
        const attributes: SQLValueAttributes = this.getSQLValueAttributes(this.tableName, entity);

        const createdAtDate = new Date();
        const createdAtAttribute: SQLValueAttribute =
            new SQLValueAttribute("created_at", this.tableName, createdAtDate);
        attributes.addAttribute(createdAtAttribute);

        entity.createdAt = createdAtDate;

        return attributes;
    }

    /**
     * Executes multiple update queries and returns the number of affected rows.
     * Watch the order of the queries. Statements are executed in this order. If no
     * additional updates are provided, than the update-query of the of the current facade
     * with the passed attributes is executed. Otherwise the update-queries of the passed facades are
     * executed with the given entity in the specified order.
     *
     * facade: facade to execute update in
     * entity: entity to insert
     *
     * @param attributes name-value pairs of the entity that should be changed
     * @param additionalUpdates additionalUpdates to execute facade is for
     */
    protected async updateStatement(attributes: SQLValueAttributes,
                                    additionalUpdates?: Array<{facade: any, entity: EntityType}>): Promise<number> {
        // array of queries
        const funcArray: ITransactionQuery[] = [];
        if (additionalUpdates) {
            for (const update of additionalUpdates) {
                const func: ITransactionQuery = {
                    attributes: update.facade.getSQLUpdateValueAttributes(update.entity),
                    function: update.facade.getUpdateQueryFn
                };
                funcArray.push(func);
            }
        }  else {
            funcArray.push({function: this.getUpdateQueryFn, attributes});
        }
        const result = await databaseConnection.transaction(funcArray);
        return result.reduce((pv, cv) => pv + cv, 0);
    }

    /**
     * Returns a function for executing an update-query.
     * Returned function can be executed to update the specified row(s) with the given values.
     * Returned function executes exactly one update-statement.
     *
     * Checks if the facade has a non empty filter. If not the update-query can not be performed.
     * This is a security reason that an update can't be performed on the whole table.
     *
     * @param connection database connection for the query
     * @param attributes attributes for the update query
     */
    protected getUpdateQueryFn: (connection: PoolConnection, attributes: SQLValueAttributes) => Promise<any> =
        (connection: PoolConnection, attributes: SQLValueAttributes) => {
        if (this._filter.isEmpty) {
            const error = `${loggerString(__dirname, BaseFacade.name, "update")} ` +
             `No WHERE-clause for update-query specified!`;
            logger.error(error);
            throw new Error(error);
        }

        const npq = this.getUpdateQuery(attributes);

        return new Promise<any>((resolve, reject) => {
            const query = connection.query(npq.query, npq.params, (error: MysqlError, results) => {

                logger.debug(`${loggerString(__dirname, BaseFacade.name, "update")} ${query.sql}`);

                if (error) {
                    logger.error(`${loggerString(__dirname, BaseFacade.name, "update")} ${error.message}`);
                    return reject(error);
                }

                resolve(results.changedRows);
            });
        });
    };

    /**
     * Return attributes that are common to all updates (modified_at).
     *
     * @param entity entity to take values for the update statement
     */
    protected getSQLUpdateValueAttributes(entity: EntityType): SQLValueAttributes {
        const attributes: SQLValueAttributes = this.getSQLValueAttributes(this.tableAlias, entity);

        const modifiedAtDate = new Date();
        const modifiedAtAttribute: SQLValueAttribute =
            new SQLValueAttribute("modified_at", this.tableAlias, modifiedAtDate);
        attributes.addAttribute(modifiedAtAttribute);

        entity.modifiedAt = modifiedAtDate;

        return attributes;
    }

    /**
     * Executes multiple delete queries in a transaction and returns the number of affected rows.
     * Watch the order of the queries. Statements are executed in this order. If no
     * additional deletes are provided, than the delete-query of the of the current facade
     * with the passed attributes is executed. Otherwise the delete-queries of the passed facades are
     * executed with the given entity in the specified order.
     *
     * @param additionalFacades an array of facades that provide delete-queries that should be executed.
     */
    protected async deleteStatement(additionalFacades?: any[]): Promise<number> {
        // array of queries
        const funcArray: ITransactionQuery[] = [];
        if (additionalFacades) {
            for (const facade of additionalFacades) {
                const func: ITransactionQuery = {function: facade.getDeleteQueryFn};
                funcArray.push(func);
            }
        } else {
          funcArray.push({function: this.getDeleteQueryFn});
        }

        const result = await databaseConnection.transaction(funcArray);
        return result.reduce((pv, cv) => pv + cv, 0);
    }

    /**
     * Returns the function for executing delete queries.
     * Function can be executed to delete the specified entities.
     * Returned function executes exactly one update-statement.
     *
     * Checks if the facade has a non empty filter. If not the update-query can not be performed.
     * This is a security reason that an update can't be performed on the whole table.
     *
     * @param connection connection to the database
     */
    protected getDeleteQueryFn: (connection: PoolConnection, attributes?: SQLValueAttributes) => Promise<any> =
        (connection: PoolConnection) => {
        if (this._filter.isEmpty) {
            const error = `${loggerString(__dirname, BaseFacade.name, "delete")} ` +
            `No WHERE-clause for delete query specified!`;
            logger.error(error);
            throw new Error(error);
        }

        const npq = this.getDeleteQuery();

        return new Promise<any>((resolve, reject) => {
            const query = connection.query(npq.query, npq.params,
                (error: MysqlError, results: any) => {

                logger.debug(`${loggerString(__dirname, BaseFacade.name, "delete")} ${query.sql}`);

                if (error) {
                    return connection.rollback(() => {
                        logger.error(`${loggerString(__dirname, BaseFacade.name, "delete")}
                        Transaction changes are rollbacked!`);
                        logger.error(`${loggerString(__dirname, BaseFacade.name, "delete")} ${error.message}`);
                        return reject(error);
                    });
                }
                resolve(results.affectedRows);
            });
        });
    };

    /**
     * Returns sql-value attributes for insert-statements and update-statements.
     *
     * @param prefix prefix before the sql attribute
     * @param entity entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, entity: EntityType): SQLValueAttributes {
        return new SQLValueAttributes();
    }

    /**
     * Assigns the retrieved values to the newly created entity and returns the entity.
     *
     * @param result results from the select query
     */
    protected abstract fillEntity(result: any): EntityType;

    /**
     * Fills default attributes that every model has (id, created_at, modified_at)
     * in the entity.
     *
     * @param result result to take values from
     * @param entity entity to fill
     */
    protected fillDefaultAttributes(result: any, entity: EntityType): EntityType {
        if (result[this.name("id")] !== undefined) {
            entity.id = result[this.name("id")];
        }

        if (result[this.name("created_at")] !== undefined) {
            entity.createdAt = result[this.name("created_at")];
        }

        if (result[this.name("modified_at")] !== undefined) {
            entity.modifiedAt = result[this.name("modified_at")];
        }

        return entity;
    }

    /**
     * Post process the results of a select query.
     * e.g.: Handle joins: Joins increase the size of the result set with
     * duplicate rows. This must be handled.
     *
     * @param entities entities that where returned from the database
     */
    protected postProcessSelect(entities: EntityType[]): EntityType[] {
        return entities;
    }

    /**
     * Post filtering of results that were fetched from the database.
     * Additional filtering can be applied, which not be easy to describe
     * in sql.
     *
     * @param entities entities that should be filtered
     */
    private _postProcessFilter: (entities: EntityType[]) => EntityType[] = (entities) => {
        return entities;
    };

    /**
     * Creates and returns a select-query.
     * Converts the filter of the facade to a sql-where clause and appends
     * it the query. Order-by are appended to the query afterwards. Returns an
     * object of IQuery, which contains the query and the replacement
     * variables as an array.
     *
     * @param attributes columns that should be selected
     * @param filter select query where clause
     */
    private getSelectQuery(attributes: SQLAttributes, filter: Filter): IQuery {
        const npq: SelectQuery = new SelectQuery();

        const select: SQLSelect = new SQLSelect(attributes);
        const from: SQLFrom = new SQLFrom(this._tableName, this._tableAlias);

        npq.sqlSelect = select;
        npq.sqlFrom = from;
        npq.addJoins(this.joins);
        npq.sqlWhere = BaseFacade.getSQLFilter(filter);
        npq.sqlOrderBy = this._ordering.orderBys;

        const selectQuery: BakedQuery = npq.bake();
        const params: any[] = selectQuery.fillParameters();

        return {query: selectQuery.getBakedSQL(), params};
    }

    /**
     * Creates and returns an insert-query.
     * Converts the filter of the facade to a sql-where clause and appends
     * it the query. Returns an object of IQuery, which contains the query
     * and the replacement variables as an array.
     *
     * @param attributes columns that should be inserted
     */
    private getInsertQuery(attributes: SQLValueAttributes): IQuery {
        const npq: InsertQuery = new InsertQuery();
        const insert: SQLInsert = new SQLInsert(this._tableName);

        insert.attributes = attributes;
        npq.insert = insert;

        const insertQuery: BakedQuery = npq.bake();
        const params: any[] = insertQuery.fillParameters();

        return {query: insertQuery.getBakedSQL(), params};
    }

    /**
     * Creates and returns an update-query.
     * Converts the filter of the facade to a sql-where clause and appends
     * it to the query. Returns an object of IQuery, which contains the query
     * and the replacement variables as an array.
     *
     * @param attributes columns that should be set for update
     */
    private getUpdateQuery(attributes: SQLValueAttributes): IQuery {
        const npq: UpdateQuery = new UpdateQuery();
        const update: SQLUpdate = new SQLUpdate(this._tableName, this._tableAlias);

        update.attributes = attributes;
        npq.update = update;
        npq.where = BaseFacade.getSQLFilter(this._filter);

        const updateQuery: BakedQuery = npq.bake();
        const params: any[] = updateQuery.fillParameters();

        return {query: updateQuery.getBakedSQL(), params};
    }

    /**
     * Creates and returns a delete-query.
     * Converts the filter of the facade to a sql-where clause and appends it
     * to the query. Returns an object of IQuery, which contains the query
     * and the replacement variables as an array.
     *
     * As a workaround the table-alias in the query is replaced, because it is
     * not allowed in a delete query.
     */
    private getDeleteQuery(): IQuery {
        const npq: DeleteQuery = new DeleteQuery();

        npq.delete = new SQLDelete(this._tableName, this._tableAlias);
        npq.where = BaseFacade.getSQLFilter(this._filter);

        const deleteQuery: BakedQuery = npq.bake();
        const params: any[] = deleteQuery.fillParameters();

        let queryStr: string = deleteQuery.getBakedSQL();
        const regex: RegExp = new RegExp(this._tableAlias + "\\.", "g");
        queryStr = queryStr.replace(regex, ""); // workaround for delete

        return {query: queryStr, params};
    }

    /**
     * Prints performance infos about the select query.
     * Analyses the cardinality of the different joins and prints a warning or
     * an error message, if a specific limit is exceeded.
     * Counts the inner- and left-joins and prints the to the console.
     */
    private joinAnalyzer(): void {
        let oneToManyJoinAmount = 0;
        let oneToOneJoinAmount = 0;

        let leftJoinAmount = 0;
        let innerJoinAmount = 0;

        for (const join of this.joins) {
            if (join.joinCardinality === JoinCardinality.ONE_TO_MANY) {
                oneToManyJoinAmount++;
            }

            if (join.joinCardinality === JoinCardinality.ONE_TO_ONE) {
                oneToOneJoinAmount++;
            }

            if (join.joinType === JoinType.LEFT_JOIN) {
                leftJoinAmount++;
            }

            if (join.joinType === JoinType.JOIN) {
                innerJoinAmount++;
            }
        }

        if (this.joins.length > 0) {
            logger.debug(`${loggerString(__dirname, BaseFacade.name, "joinAnalyzer")} ` +
                `Statement contains ${this.joins.length} joins! (${leftJoinAmount} left-joins, ` +
                `${innerJoinAmount} inner-joins, ${oneToManyJoinAmount} one-to-many, ` +
                `${oneToOneJoinAmount} one-to-one)!`);

            const warnToManyJoins: number = Number(process.env.WARN_ONE_TO_MANY_JOINS) || 5;
            if (oneToManyJoinAmount >= warnToManyJoins) {
                logger.warn(`${loggerString(__dirname, BaseFacade.name, "joinAnalyzer")} ` +
                    `Safe amount of one-to-many joins (${oneToManyJoinAmount}) exceeded!`);
            }
        }
    }
}

interface IQuery {
    query: string;
    params: any[];
}
