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
import { DatabaseConnection } from "../util/DatabaseConnection";
import { FieldInfo, MysqlError } from "mysql";
import logger from "../util/logger";
import { Helper } from "../util/Helper";
import { Filter } from "./filter/Filter";
import { SQLOrderBy } from "./sql/SQLOrderBy";
import { SQLOrder } from "./sql/SQLOrder";
import { FilterAttribute } from "./filter/FilterAttribute";
import { SQLComparisonOperator } from "./sql/SQLComparisonOperator";

/**
 * base class for crud operations with the database
 */
export abstract class BaseFacade<EntityType extends AbstractModel> {

  private _tableName: string;
  private _tableAlias: string;
  private _attributes: string[];

  protected _orderBys: SQLOrderBy[] = [];
  protected _filter: Filter;

  private readonly _dbInstance: DatabaseConnection;

  /**
   * returns sql attributes that should be retrieved from the database
   */
  public getSQLAttributes(excludedSQLAttributes: string[]): SQLAttributes {
    return new SQLAttributes();
  }

  /**
   * @param tableName
   * @param tableAlias
   */
  protected constructor(tableName: string, tableAlias: string) {
    this._tableName = tableName;
    this._tableAlias = tableAlias;
    this._dbInstance = DatabaseConnection.getInstance();

    this._filter = new Filter(tableAlias);
  }

  /**
   * executes an select query and returns the results
   * @param attributes attributes that should be retrieved
   * @param joins joins to other tables
   * @param filter
   */
  public select(attributes: SQLAttributes, joins: SQLJoin[], filter: Filter): Promise<EntityType[]> {
    const npq: SelectQuery = this.getSelectQuery(attributes, joins, this.getFilter(), this._orderBys);
    const selectQuery: BakedQuery = npq.bake();
    let returnEntities: EntityType[] = [];
    const params: (string | number)[] = selectQuery.fillParameters();

    return new Promise<EntityType[]>((resolve, reject) => {
      const query = this._dbInstance.connection.query(selectQuery.getBakedSQL(), params, (error: MysqlError, results, fields: FieldInfo[]) => {
        if (error) {
          reject(error);
        }

        for (const item of results) {
          const entity: EntityType = this.fillEntity(item);
          if (entity !== undefined) {
            returnEntities.push(entity);
          }
        }

        returnEntities = this.postProcessSelect(returnEntities);

        resolve(returnEntities);
      });

      logger.debug(`${Helper.loggerString(__dirname, BaseFacade.name, "select")} ${query.sql} [${query.values}]`);
    });
  }

  /**
   * executes an insert query and returns the id of the newly inserted row
   * @param attributes name-value pairs of attributes that should be inserted
   */
  public insert(attributes: SQLValueAttributes): Promise<number> {
    const npq: InsertQuery = this.getInsertQuery(attributes);
    const insertQuery: BakedQuery = npq.bake();
    const params: (number | string)[] = insertQuery.fillParameters();

    return new Promise<number>((resolve, reject) => {
      const query = this._dbInstance.connection.query(insertQuery.getBakedSQL(), params, (error: MysqlError, results, fields: FieldInfo[]) => {
        if (error) {
          return reject(error);
        }

        resolve(results.insertId);
      });

      logger.debug(`${Helper.loggerString(__dirname, BaseFacade.name, "insert")} ${query.sql} [${query.values}]`);
    });
  }

  /**
   * executes an update query and returns the number of affected rows
   * @param attributes name-value pairs of the entity that should be changed
   * @param filter
   */
  public update(attributes: SQLValueAttributes, filter: Filter): Promise<number> {
    const npq: UpdateQuery = this.getUpdateQuery(attributes, this.getFilter());
    const updateQuery: BakedQuery = npq.bake();
    const params: (number | string)[] = updateQuery.fillParameters();

    return new Promise<number>((resolve, reject) => {
      const query = this._dbInstance.connection.query(updateQuery.getBakedSQL(), params, (error: MysqlError, results, fields: FieldInfo[]) => {
        if (error) {
          return reject(error);
        }

        resolve(results.affectedRows);
      });

      logger.debug(`${Helper.loggerString(__dirname, BaseFacade.name, "update")} ${query.sql} [${query.values}]`);
    });
  }

  /**
   * executes a delete query and returns the number of affected rows
   * @param filter Filter
   */
  public delete(filter: Filter): Promise<number> {
    const npq: DeleteQuery = this.getDeleteQuery(this.getFilter());
    const deleteQuery: BakedQuery = npq.bake();
    const params: (number | string)[] = deleteQuery.fillParameters();

    let queryStr: string = deleteQuery.getBakedSQL();
    const regex: RegExp = new RegExp(this._tableAlias + "\\.", "g");
    queryStr = queryStr.replace(regex, ""); // workaround for delete

    return new Promise<number>((resolve, reject) => {
      const query = this._dbInstance.connection.query(queryStr, params, (error: MysqlError, results, fields: FieldInfo[]) => {
        if (error) {
          return reject(error);
        }

        resolve(results.affectedRows);
      });

      logger.debug(`${Helper.loggerString(__dirname, BaseFacade.name, "delete")} ${query.sql} [${query.values}]`);

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
   * execute a sql query
   * @param sql sql query to be executed
   * @param params parameters for prepared query that are later replaced
   */
  public query(sql: string, params: string[] = []): Promise<any[]> {
    const returnArr: any[] = [];
    return new Promise<EntityType[]>((resolve, reject) => {
      const query = this._dbInstance.connection.query(sql, params, (error: MysqlError, results, fields: FieldInfo[]) => {
        if (error) {
          reject(error);
        }

        for (const item of results) {
          returnArr.push(item);
        }

        resolve(returnArr);
      });

      logger.debug(`${Helper.loggerString(__dirname, BaseFacade.name, "query")} ${query.sql} [${query.values}]`);
    });
  }

  /**
   * creates joins for the entity and returns them as a list
   */
  public getJoins(): SQLJoin[] {
    return [];
  }

  /**
   * assigns the retrieved values to the newly created entity and returns it
   * @param results results from the select query
   */
  public abstract fillEntity(results: any[]): EntityType;

  /**
   * add an order by to the select query
   * @param attribute
   * @param order
   */
  public abstract addOrderBy(attribute: string, order: SQLOrder): void;

  /**
   * adds a filter attribute to the facade
   * @param name name of the attribute e.g.: id
   * @param value value of the attribute
   * @param operator comparison attribute
   */
  public addFilter(name: string, value: string|number, operator: SQLComparisonOperator): void {
    this._filter.addFilterAttribute(new FilterAttribute(name, value, operator));
  }

  protected getFilter(): SQLWhere {
    return new SQLWhere(this._filter.getBlock());
  }

  /**
   * clear order bys
   */
  public clearOrderBys(): void {
    this._orderBys = [];
  }

  /**
   * clear filter
   */
  public clearFilter(): void {
    this._filter = new Filter(this._tableAlias);
  }

  /**
   * post process the results of a select query
   * e.g.: handle joins
   * @param entities entities that where returned from the database
   */
  public postProcessSelect(entities: EntityType[]): EntityType[] {
    return entities;
  }

  /**
   * returns the fully qualified name (columnName + tableAlias)
   * @param column name of the column
   */
  public name(column: string): string {
    return column + this._tableAlias;
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
}
