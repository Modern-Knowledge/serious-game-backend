/**
 * base filter for all filters
 * contains attributes that all filters have in common
 */
export abstract class AbstractFilter {
  private _id: string;
  private _createdAt: string;
  private _modifiedAt: string;

  protected constructor() {}

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get createdAt(): string {
    return this._createdAt;
  }

  set createdAt(value: string) {
    this._createdAt = value;
  }

  get modifiedAt(): string {
    return this._modifiedAt;
  }

  set modifiedAt(value: string) {
    this._modifiedAt = value;
  }
}
