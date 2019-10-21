import { FoodCategory } from "../lib/models/FoodCategory";

const vegetables = new FoodCategory();
vegetables.name = "Obst & Gemüse";

const bread = new FoodCategory();
bread.name = "Brot & Gebäck";

const drinks = new FoodCategory();
drinks.name = "Getränke";

const chilledGoods = new FoodCategory();
chilledGoods.name = "Kühlwaren";

const deepFrozen = new FoodCategory();
deepFrozen.name = "Tiefkühl";

const sweets = new FoodCategory();
sweets.name = "Süßes & Salziges";

const care = new FoodCategory();
care.name = "Pflege";

const household = new FoodCategory();
household.name = "Haushalt";

export { vegetables, bread, drinks, chilledGoods, deepFrozen, sweets, care, household };