import User from "../lib/model/User";
import { AbstractDao } from "./AbstractDao";

/**
 *
 */
export class UserDaoImpl extends AbstractDao<User> {
  /**
   * @param tableName
   * @param tableAlias
   */
  constructor(tableName: string, tableAlias: string) {
    super(tableName, tableAlias);
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

  all(): User[] {
    return [];
  }

}
