import { FoodCategory } from "serious-game-library/dist/models/FoodCategory";

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

const stapleFood = new FoodCategory();
stapleFood.id = 7;
stapleFood.name = "Grundnahrungsmittel";

export { vegetables, bread, drinks, chilledGoods, deepFrozen, sweets, stapleFood };
