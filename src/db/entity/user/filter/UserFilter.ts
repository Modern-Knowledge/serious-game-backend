import { AbstractFilter } from "../../../../filter/AbstractFilter";
import { AppliedFilter } from "../../../../filter/AppliedFilter";

export class UserFilter extends AbstractFilter {

  private _username: string;

  constructor() {
    super();
  }

  get username(): string {
    return this._username;
  }

  set username(value: string) {
    this._username = value;
  }

  public applyFilter(tableAlias: string): AppliedFilter {
    const appliedFilter: AppliedFilter =  super.applyFilter(tableAlias);

    if (this.username !== undefined) {
      appliedFilter.addParam(this.username, "username", tableAlias);
    }

    return appliedFilter;
  }
}
