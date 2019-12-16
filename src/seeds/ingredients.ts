import { Ingredient } from "../lib/models/Ingredient";
import { bread, chilledGoods, deepFrozen, stapleFood, vegetables } from "./foodCategories";

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

const spinach = new Ingredient();
spinach.id = 3;
spinach.name = "Spinat";
spinach.foodCategoryId = deepFrozen.id;
spinach.imageId = 2;

const porkMeat = new Ingredient();
porkMeat.id = 4;
porkMeat.name = "Schweinefleisch";
porkMeat.foodCategoryId = chilledGoods.id;
porkMeat.imageId = 2;

const potato = new Ingredient();
potato.id = 5;
potato.name = "Kartoffel";
potato.foodCategoryId = vegetables.id;
potato.imageId = 2;

const sauerkraut = new Ingredient();
sauerkraut.id = 6;
sauerkraut.name = "Sauerkraut";
sauerkraut.foodCategoryId = stapleFood.id;
sauerkraut.imageId = 2;

const beef = new Ingredient();
beef.id = 7;
beef.name = "Rindfleisch";
beef.foodCategoryId = chilledGoods.id;
beef.imageId = 2;

const noodle = new Ingredient();
noodle.id = 8;
noodle.name = "Nudeln";
noodle.foodCategoryId = stapleFood.id;
noodle.imageId = 2;

const ham = new Ingredient();
ham.id = 9;
ham.name = "Schinken";
ham.foodCategoryId = chilledGoods.id;
ham.imageId = 2;

const cheese = new Ingredient();
cheese.id = 10;
cheese.name = "Käse";
cheese.foodCategoryId = chilledGoods.id;
cheese.imageId = 2;

const paprika = new Ingredient();
paprika.id = 11;
paprika.name = "Paprika";
paprika.foodCategoryId = vegetables.id;
paprika.imageId = 2;

const dough = new Ingredient();
dough.id = 12;
dough.name = "Teig";
dough.foodCategoryId = chilledGoods.id;
dough.imageId = 2;

const tomatoSauce = new Ingredient();
tomatoSauce.id = 13;
tomatoSauce.name = "Tomatensauce";
tomatoSauce.foodCategoryId = stapleFood.id;
tomatoSauce.imageId = 2;

const salad = new Ingredient();
salad.id = 14;
salad.name = "Salat";
salad.foodCategoryId = vegetables.id;
salad.imageId = 2;

const bun = new Ingredient();
bun.id = 15;
bun.name = "Brot";
bun.foodCategoryId = bread.id;
bun.imageId = 2;

const onion = new Ingredient();
onion.id = 16;
onion.name = "Zwiebel";
onion.foodCategoryId = vegetables.id;
onion.imageId = 2;

const spaetzle = new Ingredient();
spaetzle.id = 17;
spaetzle.name = "Spätzle";
spaetzle.foodCategoryId = stapleFood.id;
spaetzle.imageId = 2;

export {
    egg, oil, spinach, porkMeat, potato, sauerkraut, beef,
    noodle, ham, cheese, paprika, dough, tomatoSauce, salad,
    bun, onion, spaetzle
};
