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
 *
 */
export abstract class BaseFacade<EntityType extends AbstractModel, FilterType extends AbstractFilter> {

  /**
   *
   * @param filter
   */
  public getSQLAttributes(filter: FilterType): SQLAttributes {
    return new SQLAttributes();
  }

  private _tableName: string;
  private _tableAlias: string;
  private _attributes: string[];

  private readonly _dbInstance: DatabaseConnection;

  /**
   *
   * @param tableName
   * @param tableAlias
   */
  protected constructor(tableName: string, tableAlias: string) {
    this._tableName = tableName;
    this._tableAlias = tableAlias;
    this._dbInstance = DatabaseConnection.getInstance();
  }

  /**
   *
   * @param attributes
   * @param joins
   * @param filter
   */
  public select(attributes: SQLAttributes, joins: SQLJoin[], filter: FilterType): EntityType[] {
    const npq: SelectQuery = this.getSelectQuery(attributes, joins, this.getFilter(filter));
    const selectQuery: BakedQuery = npq.bake();
    let returnEntities: EntityType[] = [];
    const params: string[] = selectQuery.fillParameters();

    const query = this._dbInstance.connection.query(selectQuery.getBakedSQL(), params, (error: MysqlError, results, fields: FieldInfo[]) => {
      if (error) {
        throw error;
      }

      for (const item of results) {
        const entity: EntityType = this.fillEntity(item, filter);
        if (entity !== undefined) {
          returnEntities.push(entity);
        }
      }

      returnEntities = this.postProcessSelect(returnEntities);

      console.log(returnEntities);
    });

    logger.debug(`${Helper.loggerString(__dirname, BaseFacade.name, "select")} ${query.sql} [${query.values}]`);

    return returnEntities;
  }

  /**
   *
   * @param attributes
   */
  public insert(attributes: SQLValueAttributes): number {
    const npq: InsertQuery = this.getInsertQuery(attributes);
    const insertQuery: BakedQuery = npq.bake();
    const params: string[] = insertQuery.fillParameters();
    let id: number = 0;

    const query = this._dbInstance.connection.query(insertQuery.getBakedSQL(), params, (error: MysqlError, results, fields: FieldInfo[]) => {
      if (error) {
        throw error;
      }

      id = results.insertId;

      console.log(results);
    });

    logger.debug(`${Helper.loggerString(__dirname, BaseFacade.name, "insert")} ${query.sql} [${query.values}]`);

    return id > 0 ? id : 0;
  }

  /**
   *
   * @param attributes
   * @param where
   */
  public update(attributes: SQLValueAttributes, where: SQLWhere): number {
    const npq: UpdateQuery = this.getUpdateQuery(attributes, where);
    const updateQuery: BakedQuery = npq.bake();
    const params: string[] = updateQuery.fillParameters();
    let affectedRows: number = 0;

    const query = this._dbInstance.connection.query(updateQuery.getBakedSQL(), params, (error: MysqlError, results, fields: FieldInfo[]) => {
      if (error) {
        throw error;
      }

      console.log(results);

      affectedRows = results.affectedRows;
    });

    logger.debug(`${Helper.loggerString(__dirname, BaseFacade.name, "update")} ${query.sql} [${query.values}]`);

    return affectedRows > 0 ? affectedRows : 0;
  }

  /**
   *
   * @param filter
   */
  public delete(filter: FilterType): number {
    // workaround because tableAlias is not allowed in delete statement
    const alias: string = this._tableAlias;
    this._tableAlias = this._tableName;
    const where: SQLWhere = this.getFilter(filter);

    const npq: DeleteQuery = this.getDeleteQuery(where);
    const deleteQuery: BakedQuery = npq.bake();
    const params: string[] = deleteQuery.fillParameters();
    let affectedRows: number = 0;


    this._tableAlias = alias;

    const query = this._dbInstance.connection.query(deleteQuery.getBakedSQL(), params, (error: MysqlError, results, fields: FieldInfo[]) => {
      if (error) {
        throw error;
      }

      console.log(results);
      affectedRows = results.affectedRows;
    });

    logger.debug(`${Helper.loggerString(__dirname, BaseFacade.name, "delete")} ${query.sql} [${query.values}]`);

    return affectedRows > 0 ? affectedRows : 0;
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
   * @param results
   * @param filter
   */
  public abstract fillEntity(results: any[], filter: FilterType): EntityType;

  /**
   *
   * @param entities
   */
  public postProcessSelect(entities: EntityType[]): EntityType[] {
    return entities;
  }

  /**
   *
   * @param column
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
