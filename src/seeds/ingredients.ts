/*
 * Copyright (c) 2020 Florian Mold
 * All rights reserved.
 */

import { Ingredient } from "../lib/models/Ingredient";
import {bread, chilledGoods, deepFrozen, stapleFood, sweets, vegetables} from "./foodCategories";

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
spinach.imageId = 3;

const porkMeat = new Ingredient();
porkMeat.id = 4;
porkMeat.name = "Schweinefleisch";
porkMeat.foodCategoryId = chilledGoods.id;
porkMeat.imageId = 4;

const potato = new Ingredient();
potato.id = 5;
potato.name = "Kartoffel";
potato.foodCategoryId = vegetables.id;
potato.imageId = 5;

const sauerkraut = new Ingredient();
sauerkraut.id = 6;
sauerkraut.name = "Sauerkraut";
sauerkraut.foodCategoryId = stapleFood.id;
sauerkraut.imageId = 6;

const beef = new Ingredient();
beef.id = 7;
beef.name = "Rindfleisch";
beef.foodCategoryId = chilledGoods.id;
beef.imageId = 7;

const noodle = new Ingredient();
noodle.id = 8;
noodle.name = "Nudeln";
noodle.foodCategoryId = stapleFood.id;
noodle.imageId = 8;

const ham = new Ingredient();
ham.id = 9;
ham.name = "Schinken";
ham.foodCategoryId = chilledGoods.id;
ham.imageId = 9;

const cheese = new Ingredient();
cheese.id = 10;
cheese.name = "Käse";
cheese.foodCategoryId = chilledGoods.id;
cheese.imageId = 10;

const paprika = new Ingredient();
paprika.id = 11;
paprika.name = "Paprika";
paprika.foodCategoryId = vegetables.id;
paprika.imageId = 11;

const dough = new Ingredient();
dough.id = 12;
dough.name = "Teig";
dough.foodCategoryId = chilledGoods.id;
dough.imageId = 12;

const tomatoSauce = new Ingredient();
tomatoSauce.id = 13;
tomatoSauce.name = "Tomatensauce";
tomatoSauce.foodCategoryId = stapleFood.id;
tomatoSauce.imageId = 13;

const salad = new Ingredient();
salad.id = 14;
salad.name = "Salat";
salad.foodCategoryId = vegetables.id;
salad.imageId = 14;

const bun = new Ingredient();
bun.id = 15;
bun.name = "Brot";
bun.foodCategoryId = bread.id;
bun.imageId = 15;

const onion = new Ingredient();
onion.id = 16;
onion.name = "Zwiebel";
onion.foodCategoryId = vegetables.id;
onion.imageId = 16;

const spaetzle = new Ingredient();
spaetzle.id = 17;
spaetzle.name = "Spätzle";
spaetzle.foodCategoryId = stapleFood.id;
spaetzle.imageId = 17;

const chips = new Ingredient();
chips.id = 18;
chips.name = "Chips";
chips.foodCategoryId = sweets.id;
chips.imageId = 18;

const chocolate = new Ingredient();
chocolate.id = 19;
chocolate.name = "Schokolade";
chocolate.foodCategoryId = sweets.id;
chocolate.imageId = 19;

const pistachios = new Ingredient();
pistachios.id = 20;
pistachios.name = "Pistazien";
pistachios.foodCategoryId = sweets.id;
pistachios.imageId = 20;

const pommes = new Ingredient();
pommes.id = 21;
pommes.name = "Pommes Frites";
pommes.foodCategoryId = deepFrozen.id;
pommes.imageId = 21;

const wok = new Ingredient();
wok.id = 22;
wok.name = "Gemüse";
wok.foodCategoryId = deepFrozen.id;
wok.imageId = 22;

export {
    egg, oil, spinach, porkMeat, potato, sauerkraut, beef,
    noodle, ham, cheese, paprika, dough, tomatoSauce, salad,
    bun, onion, spaetzle, chips, chocolate, pistachios, pommes, wok
};
