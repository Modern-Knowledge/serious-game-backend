import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { User } from "../../../lib/models/User";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLJoin } from "../../sql/SQLJoin";
import { Filter } from "../../filter/Filter";

/**
 * handles CRUD operations with the user-entity
 */
export class UserFacade extends EntityFacade<User> {

  /**
   * @param tableAlias
   */
  public constructor(tableAlias?: string) {
    if (tableAlias) {
      super("users", tableAlias);
    } else {
      super("users", "u");
    }
  }

  /**
   * returns SQL-attributes for the user
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    let sqlAttributes: string[] = ["id", "username"];
    if (excludedSQLAttributes) {
      sqlAttributes = sqlAttributes.filter(function(x) {
        return excludedSQLAttributes.indexOf(x) < 0;
      });
    }

    return new SQLAttributes(this.tableAlias, sqlAttributes);
  }

  /**
   * returns users that match the specified filter
   * @param filter
   * @param excludedSQLAttributes
   */
  public getUsers(filter: Filter, excludedSQLAttributes?: string[]): Promise<User[]> {
    const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
    return this.select(attributes, this.getJoins(), filter);
  }

  /**
   * inserts a new user and returns the id of the created user
   * @param user
   */
  public insertUser(user: User): Promise<User> {
    const attributes: SQLValueAttributes = new SQLValueAttributes();

    const nameAttribute: SQLValueAttribute = new SQLValueAttribute("username", this.tableName, user.username);
    attributes.addAttribute(nameAttribute);

    return new Promise<User>((resolve, reject) => {
     this.insert(attributes).then(id => {
        if (id > 0) {
          user.id = id;
          resolve(user);
        }
     });
    });
  }

  /**
   * updates the given user in the database and returns the number of affected rows
   * @param user user that should be updated
   * @param filter
   */
  public updateUser(user: User, filter: Filter): Promise<number> {
    const attributes: SQLValueAttributes = new SQLValueAttributes();

    const username: SQLValueAttribute = new SQLValueAttribute("username", this.tableAlias, user.username);
    attributes.addAttribute(username);

    return this.update(attributes, this.getFilter(filter));
  }

  /**
   * deletes the specified user in the database and returns the number of affected rows
   * @param filter
   */
  public deleteUser(filter: Filter): Promise<number> {
    return this.delete(filter);
  }

  /**
   * assigns the retrieved values to the newly created user and returns the user
   * @param result retrieved result
   */
  public fillEntity(result: any): User {
    const u: User = new User();

    if (result[this.name("id")] !== undefined) {
      u.id = result[this.name("id")];
    }

    if (result[this.name("username")] !== undefined) {
      u.username = result[this.name("username")];
    }

    return u;
  }

  /**
   * creates the joins for the user-entity and returns them as a list
   * @param filter
   */
  public getJoins(): SQLJoin[] {
    const joins: SQLJoin[] = [];

    // example join
   /* const userJoin: SQLBlock = new SQLBlock();
    userJoin.addText("u.id = u1.id");
    joins.push(new SQLJoin("users", "u1", userJoin, JoinType.JOIN)); */

    return joins;
  }
}
