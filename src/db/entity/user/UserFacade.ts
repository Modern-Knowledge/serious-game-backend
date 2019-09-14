import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { User } from "../../../lib/models/User";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLJoin } from "../../sql/SQLJoin";

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
    let sqlAttributes: string[] = ["email", "password", "forename", "lastname", "last_login", "failed_login_attempts", "status"];
    if (excludedSQLAttributes) {
      sqlAttributes = sqlAttributes.filter(function(x) {
        return excludedSQLAttributes.indexOf(x) < 0;
      });
    }

    const superSqlAttributes: SQLAttributes = super.getSQLAttributes();
    const thisSqlAttributes: SQLAttributes = new SQLAttributes(this.tableAlias, sqlAttributes);
    thisSqlAttributes.addSqlAttributes(superSqlAttributes);

    return thisSqlAttributes;
  }

  /**
   * returns users that match the specified filter
   * @param excludedSQLAttributes
   */
  public getUsers(excludedSQLAttributes?: string[]): Promise<User[]> {
    const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
    return this.select(attributes, this.getJoins());
  }

  /**
   * inserts a new user and returns the id of the created user
   * @param user
   */
  public insertUser(user: User): Promise<User> {
    const attributes: SQLValueAttributes = new SQLValueAttributes();

    const emailAttribute: SQLValueAttribute = new SQLValueAttribute("email", this.tableName, user.email);
    attributes.addAttribute(emailAttribute);

    const passwordAttribute: SQLValueAttribute = new SQLValueAttribute("password", this.tableName, user.password);
    attributes.addAttribute(passwordAttribute);

    const forenameAttribute: SQLValueAttribute = new SQLValueAttribute("forename", this.tableName, user.forename);
    attributes.addAttribute(forenameAttribute);

    const lastnameAttribute: SQLValueAttribute = new SQLValueAttribute("lastname", this.tableName, user.lastname);
    attributes.addAttribute(lastnameAttribute);

    const lastLoginAttribute: SQLValueAttribute = new SQLValueAttribute("last_login", this.tableName, user.lastLogin);
    attributes.addAttribute(lastLoginAttribute);

    const failedLoginAttemptsAttribute: SQLValueAttribute = new SQLValueAttribute("failed_login_attempts", this.tableName, user.failedLoginAttempts);
    attributes.addAttribute(failedLoginAttemptsAttribute);

    const loginCooldownAttribute: SQLValueAttribute = new SQLValueAttribute("login_cooldown", this.tableName, user.loginCoolDown);
    attributes.addAttribute(loginCooldownAttribute);

    const statusAttribute: SQLValueAttribute = new SQLValueAttribute("status", this.tableName, user.status);
    attributes.addAttribute(statusAttribute);

    const createdAtDate = new Date();
    const createdAtAttribute: SQLValueAttribute = new SQLValueAttribute("created_at", this.tableName, createdAtDate);
    attributes.addAttribute(createdAtAttribute);

    return new Promise<User>((resolve, reject) => {
     this.insert(attributes).then(id => {
        if (id > 0) {
          user.id = id;
          user.createdAt = createdAtDate;
          resolve(user);
        }
     });
    });
  }

  /**
   * updates the given user in the database and returns the number of affected rows
   * @param user user that should be updated
   */
  public updateUser(user: User): Promise<number> {
    const attributes: SQLValueAttributes = new SQLValueAttributes();

    const emailAttribute: SQLValueAttribute = new SQLValueAttribute("email", this.tableName, user.email);
    attributes.addAttribute(emailAttribute);

    const passwordAttribute: SQLValueAttribute = new SQLValueAttribute("password", this.tableName, user.password);
    attributes.addAttribute(passwordAttribute);

    const forenameAttribute: SQLValueAttribute = new SQLValueAttribute("forename", this.tableName, user.forename);
    attributes.addAttribute(forenameAttribute);

    const lastnameAttribute: SQLValueAttribute = new SQLValueAttribute("lastname", this.tableName, user.lastname);
    attributes.addAttribute(lastnameAttribute);

    const lastLoginAttribute: SQLValueAttribute = new SQLValueAttribute("last_login", this.tableName, user.lastLogin);
    attributes.addAttribute(lastLoginAttribute);

    const failedLoginAttemptsAttribute: SQLValueAttribute = new SQLValueAttribute("failed_login_attempts", this.tableName, user.failedLoginAttempts);
    attributes.addAttribute(failedLoginAttemptsAttribute);

    const loginCooldownAttribute: SQLValueAttribute = new SQLValueAttribute("login_cooldown", this.tableName, user.loginCoolDown);
    attributes.addAttribute(loginCooldownAttribute);

    const statusAttribute: SQLValueAttribute = new SQLValueAttribute("status", this.tableName, user.status);
    attributes.addAttribute(statusAttribute);

    const modifiedAtDate = new Date();
    const modifiedAtAttribute: SQLValueAttribute = new SQLValueAttribute("modified_at", this.tableName, modifiedAtDate);
    attributes.addAttribute(modifiedAtAttribute);

    user.modifiedAt = modifiedAtDate;

    return this.update(attributes);
  }

  /**
   * deletes the specified user in the database and returns the number of affected rows
   */
  public deleteUser(): Promise<number> {
    return this.delete();
  }

  /**
   * assigns the retrieved values to the newly created user and returns the user
   * @param result retrieved result
   */
  public fillEntity(result: any): User {
    const u: User = new User();

    this.fillDefaultAttributes(u, result);

    if (result[this.name("email")] !== undefined) {
      u.email = result[this.name("email")];
    }

    if (result[this.name("password")] !== undefined) {
      u.password = result[this.name("password")];
    }

    if (result[this.name("forename")] !== undefined) {
      u.forename = result[this.name("forename")];
    }

    if (result[this.name("lastname")] !== undefined) {
      u.lastname = result[this.name("lastname")];
    }

    if (result[this.name("last_login")] !== undefined) {
      u.lastLogin = result[this.name("last_login")];
    }

    if (result[this.name("failed_login_attempts")] !== undefined) {
      u.failedLoginAttempts = result[this.name("failed_login_attempts")];
    }

    if (result[this.name("login_cooldown")] !== undefined) {
      u.loginCoolDown = result[this.name("login_cooldown")];
    }

    if (result[this.name("status")] !== undefined) {
      u.status = result[this.name("status")];
    }

    return u;
  }

  /**
   * creates the joins for the user-entity and returns them as a list
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
