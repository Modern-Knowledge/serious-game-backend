import { SQLAttributes } from "./sql/SQLAttributes";
import { SQLWhere } from "./sql/SQLWhere";
import { SQLJoin } from "./sql/SQLJoin";
import { SelectQuery } from "./sql/SelectQuery";
import { SQLSelect } from "./sql/SQLSelect";
import { SQLFrom } from "./sql/SQLFrom";
import { BakedQuery } from "./sql/BakedQuery";
import { SQLValueAttributes } from "./sql/SQLValueAttributes";
import { InsertQuery } from "./sql/InsertQuery";
import { SQLInsert } from "./sql/SQLInsert";
import { UpdateQuery } from "./sql/UpdateQuery";
import { SQLUpdate } from "./sql/SQLUpdate";
import { DeleteQuery } from "./sql/DeleteQuery";
import { SQLDelete } from "./sql/SQLDelete";
import { AbstractModel } from "../lib/models/AbstractModel";
import { FieldInfo, MysqlError, PoolConnection } from "mysql";
import logger from "../util/logger";
import { Filter } from "./filter/Filter";
import { SQLOrderBy } from "./sql/SQLOrderBy";
import { SQLOrder } from "./sql/SQLOrder";
import { Error } from "tslint/lib/error";
import { Stopwatch } from "../util/Stopwatch";
import { JoinCardinality } from "./sql/enums/JoinCardinality";
import { ExecutionTimeAnalyser } from "../util/ExecutionTimeAnalyser";
import { Ordering } from "./order/Ordering";
import { loggerString } from "../util/Helper";
import { databaseConnection } from "../util/databaseConnection";

/**
 * base class for crud operations with the database
 */
export abstract class BaseFacade<EntityType extends AbstractModel> {

    private _tableName: string;
    private _tableAlias: string;
    private _attributes: string[];

    private _ordering: Ordering;
    private _filter: Filter;


    private _postProcessFilter: (entities: EntityType[]) => EntityType[] = (entities) => {
        return entities;
    };

    /**
     * @param tableName
     * @param tableAlias
     */
    protected constructor(tableName: string, tableAlias: string) {
        this._tableName = tableName;
        this._tableAlias = tableAlias;

        this._filter = new Filter(tableAlias);
        this._ordering = new Ordering(tableAlias);
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes
     * @param allowedSqlAttributes
     */
    protected getSQLAttributes(excludedSQLAttributes?: string[], allowedSqlAttributes?: string[]): SQLAttributes {
        let sqlAttributes: string[] = ["id", "created_at", "modified_at"];

        // combine sql attributes
        sqlAttributes = sqlAttributes.concat(allowedSqlAttributes);

        // filter excluded sql attributes
        if (excludedSQLAttributes) {
            sqlAttributes = sqlAttributes.filter(function (x) {
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
    public select(attributes: SQLAttributes, filter: Filter): Promise<EntityType[]> {
        logger.info(`${loggerString(__dirname, BaseFacade.name, "select")} called`);

        BaseFacade.joinAnalyzer(this.joins);
        const npq: SelectQuery = this.getSelectQuery(attributes, this.joins, BaseFacade.getSQLFilter(filter), this._ordering.orderBys);
        const selectQuery: BakedQuery = npq.bake();
        let returnEntities: EntityType[] = [];
        const params: (string | number | Date)[] = selectQuery.fillParameters();

        const s: Stopwatch = new Stopwatch();
        return new Promise<EntityType[]>((resolve, reject) => {
            databaseConnection.poolQuery((error: MysqlError, connection: PoolConnection) => {
                if (error) {
                    logger.error(`${loggerString(__dirname, BaseFacade.name, "select")} ${error}`);
                    reject(error);
                }

                const query = connection.query(selectQuery.getBakedSQL(), params, (error: MysqlError, results, fields: FieldInfo[]) => {
                    connection.release(); // release pool connection

                    logger.debug(`${loggerString(__dirname, BaseFacade.name, "select")} ${query.sql} [${query.values}]`);
                    if (error) {
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

                    logger.info(`${loggerString(__dirname, BaseFacade.name, "select")} ${returnEntities.length} results returned!`);

                    const elapsedTime = s.timeElapsed;
                    logger.info(`${loggerString(__dirname, BaseFacade.name, "select")} results computed in ${elapsedTime}!`);

                    const eta: ExecutionTimeAnalyser = new ExecutionTimeAnalyser();
                    eta.analyse(s.measuredTime);

                    resolve(returnEntities);
                });
            });
        });
    }

    /**
     * executes an insert query and returns the id of the newly inserted row
     * @param attributes name-value pairs of attributes that should be inserted
     */
    public insert(attributes: SQLValueAttributes): Promise<number> {
        const npq: InsertQuery = this.getInsertQuery(attributes);
        const insertQuery: BakedQuery = npq.bake();
        const params: (string | number | Date)[] = insertQuery.fillParameters();

        return new Promise<number>((resolve, reject) => {
            databaseConnection.poolQuery((error: MysqlError, connection: PoolConnection) => {
                if (error) {
                    logger.error(`${loggerString(__dirname, BaseFacade.name, "insert")} ${error}`);
                    reject(error);
                }

                const query = connection.query(insertQuery.getBakedSQL(), params, (error: MysqlError, results, fields: FieldInfo[]) => {
                    connection.release(); // release pool connection

                    logger.debug(`${loggerString(__dirname, BaseFacade.name, "insert")} ${query.sql}`);

                    if (error) {
                        logger.error(`${loggerString(__dirname, BaseFacade.name, "insert")} ${error}`);
                        return reject(error);
                    }

                    resolve(results.insertId);
                });
            });
        });
    }

    /**
     * executes an update query and returns the number of affected rows
     * @param attributes name-value pairs of the entity that should be changed
     */
    public update(attributes: SQLValueAttributes): Promise<number> {
        const npq: UpdateQuery = this.getUpdateQuery(attributes, BaseFacade.getSQLFilter(this._filter));
        const updateQuery: BakedQuery = npq.bake();
        const params: (string | number | Date)[] = updateQuery.fillParameters();

        return new Promise<number>((resolve, reject) => {
            if (this._filter.isEmpty) {
                const error: string = `${loggerString(__dirname, BaseFacade.name, "update")} No WHERE-clause for update query specified!`;
                logger.error(error);
                return reject(new Error(error));
            }

            databaseConnection.poolQuery((error: MysqlError, connection: PoolConnection) => {
                if (error) {
                    logger.error(`${loggerString(__dirname, BaseFacade.name, "update")} ${error}`);
                    reject(error);
                }

                const query = connection.query(updateQuery.getBakedSQL(), params, (error: MysqlError, results, fields: FieldInfo[]) => {
                    connection.release(); // release pool connection

                    logger.debug(`${loggerString(__dirname, BaseFacade.name, "update")} ${query.sql}`);

                    if (error) {
                        logger.error(`${loggerString(__dirname, BaseFacade.name, "update")} ${error}`);
                        return reject(error);
                    }

                    resolve(results.affectedRows);
                });

            });
        });
    }

    /**
     * executes a delete query and returns the number of affected rows
     */
    public delete(): Promise<number> {
        const npq: DeleteQuery = this.getDeleteQuery(BaseFacade.getSQLFilter(this._filter));
        const deleteQuery: BakedQuery = npq.bake();
        const params: (string | number | Date)[] = deleteQuery.fillParameters();

        let queryStr: string = deleteQuery.getBakedSQL();
        const regex: RegExp = new RegExp(this._tableAlias + "\\.", "g");
        queryStr = queryStr.replace(regex, ""); // workaround for delete

        return new Promise<number>((resolve, reject) => {
            if (this._filter.isEmpty) {
                const error: string = `${loggerString(__dirname, BaseFacade.name, "delete")} No WHERE-clause for delete query specified!`;
                logger.error(error);
                return reject(new Error(error));
            }
            databaseConnection.poolQuery((error: MysqlError, connection: PoolConnection) => {
                if (error) {
                    logger.error(`${loggerString(__dirname, BaseFacade.name, "delete")} ${error}`);
                    reject(error);
                }

                const query = connection.query(queryStr, params, (error: MysqlError, results, fields: FieldInfo[]) => {
                    connection.release(); // release pool connection

                    logger.debug(`${loggerString(__dirname, BaseFacade.name, "delete")} ${query.sql}`);

                    if (error) {
                        logger.error(`${loggerString(__dirname, BaseFacade.name, "delete")} ${error}`);
                        return reject(error);
                    }

                    resolve(results.affectedRows);
                });
            });
        });
    }

    /**
     * creates and returns an insert-query
     * @param attributes columns that should be inserted
     */
    private getInsertQuery(attributes: SQLValueAttributes): InsertQuery {
        const insertQuery: InsertQuery = new InsertQuery();

        const insert: SQLInsert = new SQLInsert(this._tableName);

        insert.attributes = attributes;
        insertQuery.insert = insert;

        return insertQuery;
    }

    /**
     * creates and returns a select-query
     * @param attributes columns that should be selected
     * @param joins joins for the select query
     * @param where where-conditions for the select-query
     * @param orderBy order by attributes
     */
    private getSelectQuery(attributes: SQLAttributes, joins: SQLJoin[], where: SQLWhere, orderBy: SQLOrderBy[]): SelectQuery {
        const npq: SelectQuery = new SelectQuery();

        const select: SQLSelect = new SQLSelect(attributes);
        const from: SQLFrom = new SQLFrom(this._tableName, this._tableAlias);

        npq.sqlSelect = select;
        npq.sqlFrom = from;
        npq.addJoins(joins);
        npq.sqlWhere = where;
        npq.sqlOrderBy = orderBy;

        return npq;
    }

    /**
     * creates and returns an update-query
     * @param attributes columns that should be set
     * @param where where-conditions for the update-query
     */
    private getUpdateQuery(attributes: SQLValueAttributes, where: SQLWhere): UpdateQuery {
        const updateQuery: UpdateQuery = new UpdateQuery();
        const update: SQLUpdate = new SQLUpdate(this._tableName, this._tableAlias);

        update.attributes = attributes;
        updateQuery.update = update;
        updateQuery.where = where;

        return updateQuery;
    }

    /**
     * creates and returns a delete-query
     * @param where where-condition for the delete-query
     */
    private getDeleteQuery(where: SQLWhere): DeleteQuery {
        const deleteQuery: DeleteQuery = new DeleteQuery();

        deleteQuery.delete = new SQLDelete(this._tableName, this._tableAlias);
        deleteQuery.where = where;

        return deleteQuery;
    }

    /**
     * combine joins for the entity and returns them as a list
     */
    get joins(): SQLJoin[] {
        return [];
    }

    /**
     * assigns the retrieved values to the newly created entity and returns it
     * @param result results from the select query
     */
    protected abstract fillEntity(result: any): EntityType;

    /**
     * fill default attributes that every model has (id, created_at, modified_at)
     * @param result
     * @param entity
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
     * returns the sql-where clause
     * @param filter
     */
    private static getSQLFilter(filter: Filter): SQLWhere {
        return filter.isEmpty ? undefined : new SQLWhere(filter.getBlock());
    }

    /**
     * sets the filter
     * @param filter
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
     * @param value
     */
    set ordering(value: Ordering) {
        this._ordering = value;
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
     * post process the results of a select query
     * e.g.: handle joins
     * @param entities entities that where returned from the database
     */
    protected postProcessSelect(entities: EntityType[]): EntityType[] {
        return entities;
    }

    /**
     * returns the fully qualified name (columnName + tableAlias)
     * @param column name of the column
     */
    public name(column: string): string {
        return column + this._tableAlias;
    }

    /**
     * returns performance infos (amount, cardinality) about the sql joins
     * @param joins
     */
    private static joinAnalyzer(joins: SQLJoin[]): void {
        let oneToManyJoinAmount = 0;
        let oneToOneJoinAmount = 0;

        for (const join of joins) {
            if (join.joinCardinality === JoinCardinality.ONE_TO_MANY) {
                oneToManyJoinAmount++;
            }

            if (join.joinCardinality === JoinCardinality.ONE_TO_ONE) {
                oneToOneJoinAmount++;
            }
        }

        logger.info(`${loggerString(__dirname, BaseFacade.name, "joinAnalyzer")} Statement contains ${joins.length} joins! (${oneToManyJoinAmount} one-to-many, ${oneToOneJoinAmount} one-to-one)!`);

        const warnToManyJoins: number = Number(process.env.WARN_ONE_TO_MANY_JOINS) || 5;
        if (oneToManyJoinAmount >= warnToManyJoins) {
            logger.warn(`${loggerString(__dirname, BaseFacade.name, "joinAnalyzer")} Safe amount of one-to-many joins (${oneToManyJoinAmount}) exceeded!`);
        }

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
}
