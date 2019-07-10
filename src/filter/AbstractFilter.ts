export abstract class AbstractFilter {
  private _id: string;

  protected constructor() {}

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  public getFilter(): any {

  }
}
