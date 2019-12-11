import { Ingredient } from "../lib/models/Ingredient";
import {chilledGoods, stapleFood} from "./foodCategories";

const egg = new Ingredient();
egg.id = 1;
egg.name = "Ei";
egg.foodCategoryId = chilledGoods.id;
egg.imageId = 1;

const oil = new Ingredient();
oil.id = 2;
oil.name = "Öl";
oil.foodCategoryId = stapleFood.id;
oil.imageId = 2;

export { egg, oil };
