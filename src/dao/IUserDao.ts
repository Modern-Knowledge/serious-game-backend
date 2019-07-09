import { Dao } from "./Dao";
import User from "../lib/model/User";

export interface IUserDao extends Dao<User>{
  get(id: number): User;
  create(user: User): boolean;
  delete(user: User): boolean;
  update(user: User): boolean;
}
