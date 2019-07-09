import { DatabaseConnection } from "../util/DatabaseConnection";

export abstract class AbstractDao<T> {
  readonly tableName: string;
  readonly tableAlias: string;

  protected connection: DatabaseConnection;

  protected constructor(tableName: string, tableAlias: string) {
    this.tableName = tableName;
    this.tableAlias = tableAlias;

    this.connection = DatabaseConnection.getInstance();
  }

  abstract create(object: T): boolean;

  abstract delete(object: T): boolean;

  abstract get(id: number): T;

  abstract update(object: T): boolean;

  abstract all(): T[];
}
