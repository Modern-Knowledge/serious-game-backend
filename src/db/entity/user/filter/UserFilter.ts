import { AbstractFilter } from "../../../AbstractFilter";

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

}
