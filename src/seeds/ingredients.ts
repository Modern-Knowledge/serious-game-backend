import { Ingredient } from "../lib/models/Ingredient";
import { vegetables } from "./foodCategories";

const egg = new Ingredient();
egg.id = 1;
egg.name = "Ei";
egg.foodCategoryId = vegetables.id;

const oil = new Ingredient();
egg.id = 2;
oil.name = "Öl";
oil.foodCategoryId = vegetables.id;

export { egg, oil };