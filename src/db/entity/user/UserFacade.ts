import { EntityFacade } from "../EntityFacade";
import { UserFilter } from "./filter/UserFilter";
import { SQLWhere } from "../../sql/SQLWhere";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { User } from "../../../lib/models/User";
import { SQLBlock } from "../../sql/SQLBlock";
import { SQLParam } from "../../sql/SQLParam";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLJoin } from "../../sql/SQLJoin";

/**
 * handles CRUD operations with the user-entity
 */
export class UserFacade extends EntityFacade<User, UserFilter> {

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
   * @param filter
   */
  public getSQLAttributes(filter: UserFilter): SQLAttributes {
    return new SQLAttributes(this.tableAlias,
      ["id",
                "username"]);
  }

  /**
   * returns users that match the specified filter
   * @param filter
   */
  public getUsers(filter: UserFilter): Promise<User[]> {
    const attributes: SQLAttributes = this.getSQLAttributes(filter);

    return this.select(attributes, this.getJoins(filter), filter);
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
  public updateUser(user: User, filter: UserFilter): Promise<number> {
    const attributes: SQLValueAttributes = new SQLValueAttributes();

    const username: SQLValueAttribute = new SQLValueAttribute("username", this.tableAlias, user.username);
    attributes.addAttribute(username);

    return this.update(attributes, this.getFilter(filter));
  }

  /**
   * deletes the specified user in the database and returns the number of affected rows
   * @param filter
   */
  public deleteUser(filter: UserFilter): Promise<number> {
    return this.delete(this.getFilter(filter));
  }

  /**
   * creates the sql-filter (wherefor the user
   * @param filter
   */
  public getFilter(filter: UserFilter): SQLWhere {
    const root: SQLBlock = new SQLBlock();

    if (filter.id !== undefined) {
      const inner: SQLBlock = new SQLBlock();
      inner.addText(this.tableAlias + ".id = ::id::");
      inner.addParameter(new SQLParam("id", filter.id, false));
      root.addElement(inner);
    }
    root.addKeyword("AND");

    if (filter.username !== undefined) {
      const inner: SQLBlock = new SQLBlock();
      inner.addText(this.tableAlias + ".username = ::username::");
      inner.addParameter(new SQLParam("username", filter.username, false));
      root.addElement(inner);
    }

    root.addKeyword("AND");

    return new SQLWhere(root);
  }

  /**
   * assigns the retrieved values to the newly created user and returns the user
   * @param result retrieved result
   * @param filter
   */
  public fillEntity(result: any, filter: UserFilter): User {
    const u: User = new User();

    const id: string = this.name("id");
    if (result[id] !== undefined) {
      u.id = result[id];
    }

    const username: string = this.name("username");
    if (result[username] !== undefined) {
      u.username = result[username];
    }

    return u;
  }

  /**
   * creates the joins for the user-entity and returns them as a list
   * @param filter
   */
  public getJoins(filter: UserFilter): SQLJoin[] {
    const joins: SQLJoin[] = [];

    // example join
   /* const userJoin: SQLBlock = new SQLBlock();
    userJoin.addText("u.id = u1.id");
    joins.push(new SQLJoin("users", "u1", userJoin, JoinType.JOIN)); */

    return joins;
  }
}
