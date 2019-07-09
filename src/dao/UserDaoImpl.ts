import { IUserDao } from "./IUserDao";
import { DatabaseConnection } from "../util/DatabaseConnection";
import User from "../lib/model/User";

/**
 *
 */
export class UserDaoImpl implements IUserDao {
  readonly tableName: string;
  readonly tableAlias: string;
  readonly databaseConnection: DatabaseConnection;

  /**
   * @param tableName
   * @param tableAlias
   */
  constructor(tableName: string, tableAlias: string) {
    this.tableName = tableName;
    this.tableAlias = tableAlias;

    this.databaseConnection = DatabaseConnection.getInstance();
  }

  create(user: User): boolean {
    return false;
  }

  delete(user: User): boolean {
    return false;
  }

  get(id: number): User {
    return undefined;
  }

  update(user: User): boolean {
    return false;
  }



}
