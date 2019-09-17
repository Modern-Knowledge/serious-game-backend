import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { User } from "../../../lib/models/User";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { FilterAttribute } from "../../filter/FilterAttribute";
import { SQLComparisonOperator } from "../../sql/SQLComparisonOperator";

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
    const sqlAttributes: string[] = ["email", "password", "forename", "lastname", "last_login", "failed_login_attempts", "status"];

    return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
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
   * inserts a new user and returns the created user
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

    const emailAttribute: SQLValueAttribute = new SQLValueAttribute("email", this.tableAlias, user.email);
    attributes.addAttribute(emailAttribute);

    const passwordAttribute: SQLValueAttribute = new SQLValueAttribute("password", this.tableAlias, user.password);
    attributes.addAttribute(passwordAttribute);

    const forenameAttribute: SQLValueAttribute = new SQLValueAttribute("forename", this.tableAlias, user.forename);
    attributes.addAttribute(forenameAttribute);

    const lastnameAttribute: SQLValueAttribute = new SQLValueAttribute("lastname", this.tableAlias, user.lastname);
    attributes.addAttribute(lastnameAttribute);

    const lastLoginAttribute: SQLValueAttribute = new SQLValueAttribute("last_login", this.tableAlias, user.lastLogin);
    attributes.addAttribute(lastLoginAttribute);

    const failedLoginAttemptsAttribute: SQLValueAttribute = new SQLValueAttribute("failed_login_attempts", this.tableAlias, user.failedLoginAttempts);
    attributes.addAttribute(failedLoginAttemptsAttribute);

    const loginCooldownAttribute: SQLValueAttribute = new SQLValueAttribute("login_cooldown", this.tableAlias, user.loginCoolDown);
    attributes.addAttribute(loginCooldownAttribute);

    const statusAttribute: SQLValueAttribute = new SQLValueAttribute("status", this.tableAlias, user.status);
    attributes.addAttribute(statusAttribute);

    const modifiedAtDate = new Date();
    const modifiedAtAttribute: SQLValueAttribute = new SQLValueAttribute("modified_at", this.tableAlias, modifiedAtDate);
    attributes.addAttribute(modifiedAtAttribute);

    user.modifiedAt = modifiedAtDate;

    return this.update(attributes);
  }

  /**
   * deletes the specified user in the database and returns the number of affected rows
   */
  public deleteUser(user: User): Promise<number> {
    this._filter.addFilterAttribute(new FilterAttribute("id", user.id, SQLComparisonOperator.EQUAL));
    return this.delete();
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  protected fillEntity(result: any): User {
    const u: User = new User();
    this.fillUserEntity(result, u);

    return u;
  }

  /**
   * assigns the retrieved values to the newly created user and returns the user
   * @param result retrieved result
   * @param u entity to fill
   */
  public fillUserEntity(result: any, u: User): User {
    this.fillDefaultAttributes(result, u);

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

}
