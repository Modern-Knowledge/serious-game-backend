import User from "../lib/model/User";
import { AbstractDao } from "./AbstractDao";
import { UserFilter } from "../filter/UserFilter";
import { FieldInfo, MysqlError } from "mysql";

/**
 *
 */
export class UserDaoImpl extends AbstractDao<User, UserFilter> {
  /**
   * @param tableName
   * @param tableAlias
   */
  constructor(tableName: string = "user", tableAlias: string = "u") {
    super(tableName, tableAlias);
  }

  public create(user: User): number {
    return 0;
  }

  public delete(filter: UserFilter): boolean {
    return false;
  }

  public update(user: User): boolean {
    return false;
  }

  public all(filter: UserFilter): User[] {
    filter.id = "1";

    const user = new User();
    this.select(filter, (err: MysqlError, results: any, fields: FieldInfo[]) => {
      console.log(err);
      console.log(results);
      console.log(fields);
      user.fromMySQL(results[0]);
    });

    return [];
  }

  protected applyFilter(filter: UserFilter): {filterStr: string, params: string[]} {
    const params: string[] = [];
    let filterStr: string = "";

    if (filter.id != undefined) {
      params.push(filter.id);
      filterStr += this.tableAlias + ".id = ?";
    }

    return {filterStr: filterStr, params: params};
  }



}
