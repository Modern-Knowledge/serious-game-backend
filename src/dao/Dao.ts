export interface Dao<T> {
  get(id: number): T;
  create(object: T): boolean;
  delete(object: T): boolean;
  update(object: T): boolean;
}
