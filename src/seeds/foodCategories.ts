import { FoodCategory } from "../lib/models/FoodCategory";

const vegetables = new FoodCategory();
vegetables.id = 1;
vegetables.name = "Obst & Gemüse";

const bread = new FoodCategory();
bread.id = 2;
bread.name = "Brot & Gebäck";

const drinks = new FoodCategory();
drinks.id = 3;
drinks.name = "Getränke";

const chilledGoods = new FoodCategory();
chilledGoods.id = 4;
chilledGoods.name = "Kühlwaren";

const deepFrozen = new FoodCategory();
deepFrozen.id = 5;
deepFrozen.name = "Tiefkühl";

const sweets = new FoodCategory();
sweets.id = 6;
sweets.name = "Süßes & Salziges";

const care = new FoodCategory();
care.id = 7;
care.name = "Pflege";

const household = new FoodCategory();
household.id = 8;
household.name = "Haushalt";

export { vegetables, bread, drinks, chilledGoods, deepFrozen, sweets, care, household };