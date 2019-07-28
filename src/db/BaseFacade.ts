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
import { AbstractFilter } from "./AbstractFilter";
import { AbstractModel } from "../lib/models/AbstractModel";
import { DatabaseConnection } from "../util/DatabaseConnection";
import { FieldInfo, MysqlError } from "mysql";
import logger from "../util/logger";
import { Helper } from "../util/Helper";

/**
 * base class for crud operations with the database
 */
export abstract class BaseFacade<EntityType extends AbstractModel, FilterType extends AbstractFilter> {

  private _tableName: string;
  private _tableAlias: string;
  private _attributes: string[];

  private readonly _dbInstance: DatabaseConnection;

  /**
   * returns sql attributes that should be retrieved from the database
   * @param filter
   */
  public getSQLAttributes(filter: FilterType): SQLAttributes {
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
   */
  public select(attributes: SQLAttributes, joins: SQLJoin[], filter: FilterType): Promise<EntityType[]> {
    const npq: SelectQuery = this.getSelectQuery(attributes, joins, this.getFilter(filter));
    const selectQuery: BakedQuery = npq.bake();
    let returnEntities: EntityType[] = [];
    const params: string[] = selectQuery.fillParameters();

    return new Promise<EntityType[]>((resolve, reject) => {
      const query = this._dbInstance.connection.query(selectQuery.getBakedSQL(), params, (error: MysqlError, results, fields: FieldInfo[]) => {
        if (error) {
          return reject(error);
        }

        for (const item of results) {
          const entity: EntityType = this.fillEntity(item, filter);
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
   * @param where where-condition
   */
  public delete(where: SQLWhere): Promise<number> {
    // workaround because tableAlias is not allowed in delete statement
    const alias: string = this._tableAlias;
    this._tableAlias = this._tableName;

    const npq: DeleteQuery = this.getDeleteQuery(where);
    const deleteQuery: BakedQuery = npq.bake();
    const params: string[] = deleteQuery.fillParameters();

    this._tableAlias = alias;

    return new Promise<number>((resolve, reject) => {
      const query = this._dbInstance.connection.query(deleteQuery.getBakedSQL(), params, (error: MysqlError, results, fields: FieldInfo[]) => {
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
   */
  private getSelectQuery(attributes: SQLAttributes, joins: SQLJoin[], where: SQLWhere): SelectQuery {
    const npq: SelectQuery = new SelectQuery();

    const select: SQLSelect = new SQLSelect(attributes);
    const from: SQLFrom = new SQLFrom(this._tableName, this._tableAlias);

    npq.sqlSelect = select;
    npq.sqlFrom = from;
    npq.addJoins(joins);
    npq.sqlWhere = where;

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
   * @param filter
   */
  public getJoins(filter: FilterType): SQLJoin[] {
    return [];
  }

  /**
   * creates the sql-filter for the entity
   * @param filter
   */
  public abstract getFilter(filter: FilterType): SQLWhere;

  /**
   * assigns the retrieved values to the newly created entity and returns it
   * @param results results from the select query
   * @param filter
   */
  public abstract fillEntity(results: any[], filter: FilterType): EntityType;

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
