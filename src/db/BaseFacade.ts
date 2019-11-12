
import { FieldInfo, MysqlError, PoolConnection } from "mysql";
import { Error } from "tslint/lib/error";
import { AbstractModel } from "../lib/models/AbstractModel";
import { ExecutionTimeAnalyser } from "../util/analysis/ExecutionTimeAnalyser";
import { Stopwatch } from "../util/analysis/Stopwatch";
import { databaseConnection, TransactionQuery } from "../util/db/databaseConnection";
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

/**
 * base class for crud operations with the database
 */
export abstract class BaseFacade<EntityType extends AbstractModel<EntityType>> {

    /**
     * combine joins for the entity and returns them as a list
     */
    get joins(): SQLJoin[] {
        return [];
    }

    /**
     * Sets the filter of the facade.
     * @param filter filter that should be set for the facade
     */
    set filter(filter: Filter) {
        this._filter = filter;
    }

    /**
     * retrieves the filter for the facade
     */
    get filter(): Filter {
        return this._filter;
    }

    /**
     * returns the ordering of the facade (order-by)
     */
    get ordering(): Ordering {
        return this._ordering;
    }

    /**
     * sets the ordering of the facade (order-by)
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
     * sets the function that is applied to the result set of a select query
     * @param value function that takes an array of entity types
     */
    set postProcessFilter(value: (entities: EntityType[]) => EntityType[]) {
        this._postProcessFilter = value;
    }

    /**
     * Creates the sql where clause from the given filter.
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
        this._tableName = tableName;
        this._tableAlias = tableAlias;

        this._filter = new Filter(tableAlias);
        this._ordering = new Ordering(tableAlias);
    }

    /**
     * add an order by clause
     * @param attribute attribute for ordering
     * @param order attribute sort order (ASC|DESC)
     */
    public addOrderBy(attribute: string, order: SQLOrder = SQLOrder.DESC): void {
        this.ordering.addOrderBy(attribute, order);
    }

    /**
     * clear filter
     */
    public clearFilter(): void {
        this._filter.clear();
    }

    /**
     * returns the fully qualified name (columnName + tableAlias)
     * @param column name of the column
     */
    public name(column: string): string {
        return column + this._tableAlias;
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should be excluded from the select query
     * @param allowedSqlAttributes attributes that should be included in the function
     */
    protected getSQLAttributes(excludedSQLAttributes?: string[], allowedSqlAttributes?: string[]): SQLAttributes {
        let sqlAttributes: string[] = ["id", "created_at", "modified_at"];

        // combine sql attributes
        sqlAttributes = sqlAttributes.concat(allowedSqlAttributes);

        // filter excluded sql attributes
        if (excludedSQLAttributes) {
            sqlAttributes = sqlAttributes.filter((x) => {
                return excludedSQLAttributes.indexOf(x) < 0;
            });
        }

        return new SQLAttributes(this.tableAlias, sqlAttributes);
    }

    /**
     * executes an select query and returns the results
     * execution time of the query is analysed
     * @param attributes attributes that should be retrieved
     * @param filter filter for selected (can be different from facade filter
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
                    connection.release(); // release pool connection
                    logger.error(`${loggerString(__dirname, BaseFacade.name, "select")} ${error}`);
                    reject(error);
                }

                const query = connection.query(npq.query, npq.params,
                    (mysqlError: MysqlError, results: any, fields: FieldInfo[]) => {
                    connection.release(); // release pool connection

                    logger.debug(`${loggerString(__dirname, BaseFacade.name, "select")} ` +
                        `${query.sql} [${query.values}]`);

                    if (mysqlError) {
                        logger.error(`${loggerString(__dirname, BaseFacade.name, "select")} ${error}`);
                        reject(error);
                    }

                    for (const item of results) {
                        const entity: EntityType = this.fillEntity(item);
                        if (entity) {
                            returnEntities.push(entity);
                        }
                    }

                    returnEntities = this.postProcessSelect(returnEntities);
                    returnEntities = this._postProcessFilter(returnEntities);

                    logger.info(`${loggerString(__dirname, BaseFacade.name, "select")} `
                        + `${returnEntities.length} result(s) returned!`);

                    if (returnEntities.length > 100) {
                        logger.info(`${loggerString(__dirname, BaseFacade.name, "select")} ` +
                        `More than ${returnEntities.length} rows returned! ` +
                        `Consider using WHERE-clause to shrink result set size`);
                    }

                    const elapsedTime = s.timeElapsed;
                    logger.info(`${loggerString(__dirname, BaseFacade.name, "select")} ` +
                    `Results computed in ${elapsedTime}!`);

                    const eta: ExecutionTimeAnalyser = new ExecutionTimeAnalyser();
                    eta.analyse(s.measuredTime, BaseFacade.name + ".select");

                    resolve(returnEntities);
                });
            });
        });
    }

    /**
     * executes an insert query and returns the id of the newly inserted row
     * watch the order of the array
     * statements are executed in this order
     *
     * - facade: facade to execute insert in
     * - entity: entity to insert
     * - callBackOnInsert: callback that is executed after the insert, last callback in array will not be executed
     *
     * returns all inserted ids as array
     *
     * @param attributes name-value pairs of attributes that should be inserted
     * @param additionalInserts queries to execute in the transaction
     */
    protected async insert(
        attributes: SQLValueAttributes,
        additionalInserts?: Array<{facade: any, entity: EntityType, callBackOnInsert?: any}>):
        Promise<any[]> {

        // array of queries
        const funcArray: TransactionQuery[] = [];
        if (additionalInserts) {
            for (const insert of additionalInserts) {
                const func: TransactionQuery = {
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
     * returns the function for executing insert queries
     * @param connection database connection for the query
     * @param attributes attributes to take values for the insert
     */
    protected getInsertQueryFn: (connection: PoolConnection, attributes: SQLValueAttributes) => Promise<any> =
        (connection: PoolConnection, attributes: SQLValueAttributes) => {
        const npq: IQuery = this.getInsertQuery(attributes);

        return new Promise<any>((resolve, reject) => {
            const query = connection.query(npq.query, npq.params, (error: MysqlError, results, fields: FieldInfo[]) => {
                logger.debug(`${loggerString(__dirname, BaseFacade.name, "insert")} ${query.sql}`);

                if (error) {
                    logger.error(`${loggerString(__dirname, BaseFacade.name, "insert")} ${error}`);
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
     * executes an update query and returns the number of affected rows
     * facade to execute update in, entity is the entity for updating
     * watch the order of the array
     * statements are executed in this order
     * facade: facade to execute update in
     * entity: entity to insert
     *
     * @param attributes name-value pairs of the entity that should be changed
     * @param additionalUpdates additionalUpdates to execute facade is for
     *
     */
    protected async update(attributes: SQLValueAttributes,
                           additionalUpdates?: Array<{facade: any, entity: EntityType}>): Promise<number> {
        // array of queries
        const funcArray: TransactionQuery[] = [];
        if (additionalUpdates) {
            for (const update of additionalUpdates) {
                const func: TransactionQuery = {
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
     * returns the function for executing update queries
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
            const query = connection.query(npq.query, npq.params, (error: MysqlError, results, fields: FieldInfo[]) => {

                logger.debug(`${loggerString(__dirname, BaseFacade.name, "update")} ${query.sql}`);

                if (error) {
                    logger.error(`${loggerString(__dirname, BaseFacade.name, "update")} ${error}`);
                    return reject(error);
                }

                resolve(results.changedRows);
            });
        });
    };

    /**
     * return attributes that are common to all updates (modified_at)
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
     * if no additionalFacade is provided, than the current (this) is used
     * executes a delete query in a transaction and returns the number of affected rows
     * watch the order of the array
     * statements are executed in this order
     */
    protected async delete(additionalFacades?: any[]): Promise<number> {
        // array of queries
        const funcArray: TransactionQuery[] = [];
        if (additionalFacades) {
            for (const facade of additionalFacades) {
                const func: TransactionQuery = {function: facade.getDeleteQueryFn};
                funcArray.push(func);
            }
        } else {
          funcArray.push({function: this.getDeleteQueryFn});
        }

        const result = await databaseConnection.transaction(funcArray);
        return result.reduce((pv, cv) => pv + cv, 0);
    }

    /**
     * returns the function for executing delete queries
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
                (error: MysqlError, results: any, fields: FieldInfo[]) => {

                logger.debug(`${loggerString(__dirname, BaseFacade.name, "delete")} ${query.sql}`);

                if (error) {
                    return connection.rollback(() => {
                        logger.error(`${loggerString(__dirname, BaseFacade.name, "delete")}
                        Transaction changes are rollbacked!`);
                        logger.error(`${loggerString(__dirname, BaseFacade.name, "delete")} ${error}`);
                        return reject(error);
                    });
                }
                resolve(results.affectedRows);
            });
        });
    };

    /**
     * returns sql value attributes for insert-statement and update-statement
     * @param prefix prefix before the sql attribute
     * @param entity entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, entity: EntityType): SQLValueAttributes {
        return new SQLValueAttributes();
    }

    /**
     * assigns the retrieved values to the newly created entity and returns it
     * @param result results from the select query
     */
    protected abstract fillEntity(result: any): EntityType;

    /**
     * fill default attributes that every model has (id, created_at, modified_at)
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
     * post process the results of a select query
     * e.g.: handle joins
     * @param entities entities that where returned from the database
     */
    protected postProcessSelect(entities: EntityType[]): EntityType[] {
        return entities;
    }

    /**
     * Post filtering of results that were fetched from the database.
     * @param entities entities that should be filtered
     */
    private _postProcessFilter: (entities: EntityType[]) => EntityType[] = (entities) => {
        return entities;
    };

    /**
     * creates and returns a select-query
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
     * creates and returns an insert-query
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
     * creates and returns an update-query
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
     * creates and returns a delete-query
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
     * returns performance infos (amount, cardinality) about the sql joins
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

        logger.info(`${loggerString(__dirname, BaseFacade.name, "joinAnalyzer")} ` +
        `Statement contains ${this.joins.length} joins! (${leftJoinAmount} left-joins, ` +
        `${innerJoinAmount} inner-joins, ${oneToManyJoinAmount} one-to-many, ${oneToOneJoinAmount} one-to-one)!`);

        const warnToManyJoins: number = Number(process.env.WARN_ONE_TO_MANY_JOINS) || 5;
        if (oneToManyJoinAmount >= warnToManyJoins) {
            logger.warn(`${loggerString(__dirname, BaseFacade.name, "joinAnalyzer")} ` +
            `Safe amount of one-to-many joins (${oneToManyJoinAmount}) exceeded!`);
        }

    }
}

interface IQuery {
    query: string;
    params: any[];
}
