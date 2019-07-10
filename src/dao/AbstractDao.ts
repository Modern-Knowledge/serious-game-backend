import { DatabaseConnection } from "../util/DatabaseConnection";
import { Model } from "../lib/model/Model";
import { AbstractFilter } from "../filter/AbstractFilter";
import { FieldInfo, MysqlError } from "mysql";


/**
 * AbstractDao
 */
export abstract class AbstractDao<T extends Model<T>, F extends AbstractFilter> {
  readonly tableName: string;
  readonly tableAlias: string;

  protected connection: DatabaseConnection;

  /**
   * @param tableName
   * @param tableAlias
   */
  protected constructor(tableName: string, tableAlias: string) {
    this.tableName = tableName;
    this.tableAlias = tableAlias;

    this.connection = DatabaseConnection.getInstance();
  }

  /**
   *
   * @param object
   */
  public abstract create(object: T): number;

  /**
   * @param filter
   */
  public abstract delete(filter: F): boolean;

  /**
   * @param filter
   */
  public get(filter: F): T {
    const results: T[] = this.all(filter);

    if (results.length > 0) {
      return results[0];
    } else {
      return undefined;
    }
  }

  /**
   *
   * @param object
   */
  public abstract update(object: T): boolean;

  /**
   * @param filter
   */
  public abstract all(filter: F): T[];

  /**
   * @param sql
   * @param params
   * @param callback
   */
  protected query(sql: string, params: string[], callback: (err: MysqlError, results: any, fields: FieldInfo[]) => void): void {
    // TODO: check questionmarks and params size
    this.connection.connection.query(sql, params, callback);
  }

  /**
   *
   * @param filter
   */
  protected abstract applyFilter(filter: F): {filterStr: string, params: string[]};

  /**
   *
   * @param filter
   * @param callback
   */
  protected select(filter: F, callback: (err: MysqlError, results: any, fields: FieldInfo[]) => void): void {
    const queryStr = this.applyFilter(filter);

    const where = (queryStr.filterStr.length > 0) ? "WHERE " + queryStr.filterStr : "";

    this.query(`SELECT * FROM ${this.tableName} ${this.tableAlias} ${where}`, queryStr.params, callback);
  }

}
