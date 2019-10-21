import { FoodCategory } from "../lib/models/FoodCategory";

const vegetables = new FoodCategory();
vegetables.id = 1;
vegetables.name = "Obst & Gemüse";

const bread = new FoodCategory();
vegetables.id = 2;
bread.name = "Brot & Gebäck";

const drinks = new FoodCategory();
vegetables.id = 3;
drinks.name = "Getränke";

const chilledGoods = new FoodCategory();
vegetables.id = 4;
chilledGoods.name = "Kühlwaren";

const deepFrozen = new FoodCategory();
vegetables.id = 5;
deepFrozen.name = "Tiefkühl";

const sweets = new FoodCategory();
vegetables.id = 6;
sweets.name = "Süßes & Salziges";

const care = new FoodCategory();
vegetables.id = 7;
care.name = "Pflege";

const household = new FoodCategory();
vegetables.id = 8;
household.name = "Haushalt";

export { vegetables, bread, drinks, chilledGoods, deepFrozen, sweets, care, household };