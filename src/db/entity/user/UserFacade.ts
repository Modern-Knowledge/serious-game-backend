import { User } from "serious-game-library/dist/models/User";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * Handles CRUD operations with the user-entity.
 */
export class UserFacade extends EntityFacade<User> {

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("users", tableAlias);
        } else {
            super("users", "u");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] =
            [
                "email", "password", "forename", "lastname",
                "gender", "last_login", "failed_login_attempts",
                "login_cooldown", "status", "resetcode", "resetcode_validuntil"
            ];
        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * Inserts a new user and returns the created user.
     *
     * @param user user that should be inserted
     */
    public async insert(user: User): Promise<User> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(user);
        const result = await this.insertStatement(attributes);

        if (result.length > 0) {
            user.id = result[0].insertedId;
        }

        return user;
    }

    /**
     * Updates the user in the database and returns the number of affected rows.
     *
     * @param user user that should be updated
     */
    public update(user: User): Promise<number> {
        const attributes: SQLValueAttributes = this.getSQLUpdateValueAttributes(user);
        return this.updateStatement(attributes);
    }

    /**
     * Deletes the specified user in the database and returns the number of deleted rows.
     */
    public delete(): Promise<number> {
        return this.deleteStatement([this]);
    }

    /**
     * Assigns the retrieved result to the newly created user and returns the user.
     *
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

        if (result[this.name("failed_login_attempts")] !== undefined) {
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
     * Fills the user-entity from the result.
     *
     * @param result database results
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
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param user entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, user: User): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const emailAttribute: SQLValueAttribute = new SQLValueAttribute("email", prefix, user.email);
        attributes.addAttribute(emailAttribute);

        const passwordAttribute: SQLValueAttribute = new SQLValueAttribute("password", prefix, user.password);
        attributes.addAttribute(passwordAttribute);

        const forenameAttribute: SQLValueAttribute = new SQLValueAttribute("forename", prefix, user.forename);
        attributes.addAttribute(forenameAttribute);

        const lastnameAttribute: SQLValueAttribute = new SQLValueAttribute("lastname", prefix, user.lastname);
        attributes.addAttribute(lastnameAttribute);

        const genderAttribute: SQLValueAttribute = new SQLValueAttribute("gender", prefix, user.gender);
        attributes.addAttribute(genderAttribute);

        const lastLoginAttribute: SQLValueAttribute = new SQLValueAttribute("last_login", prefix, user.lastLogin);
        attributes.addAttribute(lastLoginAttribute);

        const failedLoginAttemptsAttribute: SQLValueAttribute
            = new SQLValueAttribute("failed_login_attempts", prefix, user.failedLoginAttempts);
        attributes.addAttribute(failedLoginAttemptsAttribute);

        const loginCooldownAttribute: SQLValueAttribute
            = new SQLValueAttribute("login_cooldown", prefix, user.loginCoolDown);
        attributes.addAttribute(loginCooldownAttribute);

        const statusAttribute: SQLValueAttribute = new SQLValueAttribute("status", prefix, user.status);
        attributes.addAttribute(statusAttribute);

        const resetcodeAttribute: SQLValueAttribute = new SQLValueAttribute("resetcode", prefix, user.resetcode);
        attributes.addAttribute(resetcodeAttribute);

        const resetcodeValidUntilAttribute: SQLValueAttribute
            = new SQLValueAttribute("resetcode_validuntil", prefix, user.resetcodeValidUntil);
        attributes.addAttribute(resetcodeValidUntilAttribute);

        return attributes;
    }
}
