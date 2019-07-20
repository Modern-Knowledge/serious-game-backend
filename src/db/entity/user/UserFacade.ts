import { EntityFacade } from "../EntityFacade";
import { UserFilter } from "./filter/UserFilter";
import { SQLWhere } from "../../sql/SQLWhere";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { User } from "../../../../../serious-game-library/src/models/User";

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

  getFilter(filter: UserFilter): SQLWhere {
    return undefined;
  }


}
