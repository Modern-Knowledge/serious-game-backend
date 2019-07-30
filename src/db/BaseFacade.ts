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

/**
 * base class for crud operations with the database
 */
export abstract class BaseFacade<EntityType extends AbstractModel> {

  private _tableName: string;
  private _tableAlias: string;
  private _attributes: string[];

  protected _orderBys: SQLOrderBy[] = [];

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
  }

  /**
   * executes an select query and returns the results
   * @param attributes attributes that should be retrieved
   * @param joins joins to other tables
   * @param filter
   * @param orderBy order by of the query
   */
  public select(attributes: SQLAttributes, joins: SQLJoin[], filter: Filter): Promise<EntityType[]> {
    const npq: SelectQuery = this.getSelectQuery(attributes, joins, this.getFilter(filter), this._orderBys);
    const selectQuery: BakedQuery = npq.bake();
    let returnEntities: EntityType[] = [];
    const params: string[] = selectQuery.fillParameters();

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
    const params: string[] = insertQuery.fillParameters();

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
   * @param where where-condition
   */
  public update(attributes: SQLValueAttributes, where: SQLWhere): Promise<number> {
    const npq: UpdateQuery = this.getUpdateQuery(attributes, where);
    const updateQuery: BakedQuery = npq.bake();
    const params: string[] = updateQuery.fillParameters();

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
    const npq: DeleteQuery = this.getDeleteQuery(this.getFilter(filter));
    const deleteQuery: BakedQuery = npq.bake();
    const params: string[] = deleteQuery.fillParameters();

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
   * creates joins for the entity and returns them as a list
   */
  public getJoins(): SQLJoin[] {
    return [];
  }

  /**
   * creates the sql-filter for the entity
   * @param filter
   */
  public getFilter(filter: Filter): SQLWhere {
    return new SQLWhere(filter.getBlock());
  }

  /**
   * assigns the retrieved values to the newly created entity and returns it
   * @param results results from the select query
   */
  public abstract fillEntity(results: any[]): EntityType;

  /**
   *
   * @param attribute
   * @param order
   */
  public abstract addOrderBy(attribute: string, order: SQLOrder): void;

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
