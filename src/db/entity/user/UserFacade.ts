import { EntityFacade } from "../EntityFacade";
import { UserFilter } from "./filter/UserFilter";
import { SQLWhere } from "../../sql/SQLWhere";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { User } from "../../../lib/models/User";
import { SQLBlock } from "../../sql/SQLBlock";
import { SQLParam } from "../../sql/SQLParam";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";

export class UserFacade extends EntityFacade<User, UserFilter> {

  public constructor(tableAlias?: string) {
    if (tableAlias) {
      super("users", tableAlias);
    } else {
      super("users", "u");
    }
  }

  getSQLAttributes(filter: UserFilter): SQLAttributes {
    return new SQLAttributes(this.tableAlias,
      ["id",
                "username"]);
  }

  public getUsers(filter: UserFilter): User[] {
    const attributes: SQLAttributes = this.getSQLAttributes(filter);

    return this.select(attributes, undefined, filter);
  }

  public insertUser(user: User) {
    const attributes: SQLValueAttributes = new SQLValueAttributes();

    const nameAttribute: SQLValueAttribute = new SQLValueAttribute("username", this.tableName, user.username);

    attributes.addAttribute(nameAttribute);

    this.insert(attributes);
  }

  public updateUser(user: User, filter: UserFilter): void {
    const attributes: SQLValueAttributes = new SQLValueAttributes();

    const username: SQLValueAttribute = new SQLValueAttribute("username", this.tableAlias, user.username);

    attributes.addAttribute(username);

    this.update(attributes, this.getFilter(filter));
  }

  public deleteUser(filter: UserFilter): void {
    this.delete(filter);
  }


  public getFilter(filter: UserFilter): SQLWhere {
    const root: SQLBlock = new SQLBlock();

    if (filter.id !== undefined) {
      const inner: SQLBlock = new SQLBlock();
      inner.addText(this.tableAlias + ".id = ::id::");
      inner.addParameter(new SQLParam("id", filter.id, false));
      root.addElement(inner);
    }

    root.addKeyword("AND");

    return new SQLWhere(root);
  }


}
