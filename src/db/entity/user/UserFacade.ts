import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { User } from "../../../lib/models/User";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import * as bcrypt from "bcryptjs";

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
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["email", "password", "forename", "lastname", "gender", "last_login", "failed_login_attempts", "status", "resetcode", "resetcode_validuntil"];
        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * inserts a new user and returns the created user
     * @param user
     */
    public async insertUser(user: User): Promise<User> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(user);
        const result = await this.insert(attributes);

        if (result.length > 0) {
            user.id = result[0].insertedId;
        }

        return user;
    }

    /**
     * updates the given user in the database and returns the number of affected rows
     * @param user user that should be updated
     */
    public updateUser(user: User): Promise<number> {
        const attributes: SQLValueAttributes = this.getSQLUpdateValueAttributes(user);
        return this.update(attributes);
    }

    /**
     * deletes the specified user in the database and returns the number of affected rows
     */
    public deleteUser(): Promise<number> {
        return this.delete([this]);
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    protected fillEntity(result: any): User {
        if (!result[this.name("id")]) {
            return undefined;
        }

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

        if (result[this.name("email")]) {
            u.email = result[this.name("email")];
        }

        if (result[this.name("password")]) {
            u.password = result[this.name("password")];
        }

        if (result[this.name("forename")]) {
            u.forename = result[this.name("forename")];
        }

        if (result[this.name("lastname")]) {
            u.lastname = result[this.name("lastname")];
        }

        if (result[this.name("gender")]) {
            u.gender = result[this.name("gender")];
        }

        if (result[this.name("last_login")]) {
            u.lastLogin = result[this.name("last_login")];
        }

        if (result[this.name("failed_login_attempts")]) {
            u.failedLoginAttempts = result[this.name("failed_login_attempts")];
        }

        if (result[this.name("login_cooldown")]) {
            u.loginCoolDown = result[this.name("login_cooldown")];
        }

        if (result[this.name("status")]) {
            u.status = result[this.name("status")];
        }

        if (result[this.name("resetcode")]) {
            u.resetcode = result[this.name("resetcode")];
        }

        if (result[this.name("resetcode_validuntil")]) {
            u.resetcodeValidUntil = result[this.name("resetcode_validuntil")];
        }

        return u;
    }

    /**
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
     * @param user entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, user: User): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const emailAttribute: SQLValueAttribute = new SQLValueAttribute("email", prefix, user.email);
        attributes.addAttribute(emailAttribute);

        const passwordAttribute: SQLValueAttribute = new SQLValueAttribute("password", prefix, bcrypt.hashSync(user.password, 12));
        attributes.addAttribute(passwordAttribute);

        const forenameAttribute: SQLValueAttribute = new SQLValueAttribute("forename", prefix, user.forename);
        attributes.addAttribute(forenameAttribute);

        const lastnameAttribute: SQLValueAttribute = new SQLValueAttribute("lastname", prefix, user.lastname);
        attributes.addAttribute(lastnameAttribute);

        const genderAttribute: SQLValueAttribute = new SQLValueAttribute("gender", prefix, user.gender);
        attributes.addAttribute(genderAttribute);

        const lastLoginAttribute: SQLValueAttribute = new SQLValueAttribute("last_login", prefix, user.lastLogin);
        attributes.addAttribute(lastLoginAttribute);

        const failedLoginAttemptsAttribute: SQLValueAttribute = new SQLValueAttribute("failed_login_attempts", prefix, user.failedLoginAttempts);
        attributes.addAttribute(failedLoginAttemptsAttribute);

        const loginCooldownAttribute: SQLValueAttribute = new SQLValueAttribute("login_cooldown", prefix, user.loginCoolDown);
        attributes.addAttribute(loginCooldownAttribute);

        const statusAttribute: SQLValueAttribute = new SQLValueAttribute("status", prefix, user.status);
        attributes.addAttribute(statusAttribute);

        const resetcodeAttribute: SQLValueAttribute = new SQLValueAttribute("resetcode", prefix, user.resetcode);
        attributes.addAttribute(resetcodeAttribute);

        const resetcodeValidUntilAttribute: SQLValueAttribute = new SQLValueAttribute("resetcode_validuntil", prefix, user.resetcodeValidUntil);
        attributes.addAttribute(resetcodeValidUntilAttribute);

        return attributes;
    }
}
