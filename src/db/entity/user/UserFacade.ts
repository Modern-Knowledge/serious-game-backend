import { EntityFacade } from "../EntityFacade";
import { UserFilter } from "./filter/UserFilter";
import { SQLWhere } from "../../sql/SQLWhere";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { User } from "../../../lib/models/User";
import { SQLBlock } from "../../sql/SQLBlock";
import { SQLParam } from "../../sql/SQLParam";

export class UserFacade extends EntityFacade<User, UserFilter> {

  public constructor(tableAlias?: string) {
    if (tableAlias) {
      super("user", tableAlias);
    } else {
      super("user", "u");
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
