import { AppliedFilter } from "./AppliedFilter";

export abstract class AbstractFilter {
  private _id: string;

  protected constructor() {}

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  public applyFilter(tableAlias: string): AppliedFilter {
    const appliedFilter: AppliedFilter = new AppliedFilter();

   if (this.id !== undefined) {
      appliedFilter.addParam(this.id, "id", tableAlias);
   }

   return appliedFilter;
  }
}
