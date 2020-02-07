import { Ingredient } from "../lib/models/Ingredient";
import {bread, chilledGoods, deepFrozen, drinks, stapleFood, sweets, vegetables} from "./foodCategories";

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

const blackbread = new Ingredient();
blackbread.id = 23;
blackbread.name = "Brot";
blackbread.foodCategoryId = bread.id;
blackbread.imageId = 23;

const icetea = new Ingredient();
icetea.id = 24;
icetea.name = "Eistee";
icetea.foodCategoryId = drinks.id;
icetea.imageId = 24;

const orangejuice = new Ingredient();
orangejuice.id = 25;
orangejuice.name = "Orangensaft";
orangejuice.foodCategoryId = drinks.id;
orangejuice.imageId = 25;

const water = new Ingredient();
water.id = 26;
water.name = "Mineralwasser";
water.foodCategoryId = drinks.id;
water.imageId = 26;

const zwieback = new Ingredient();
zwieback.id = 27;
zwieback.name = "Zwieback";
zwieback.foodCategoryId = bread.id;
zwieback.imageId = 27;

const oatmeal = new Ingredient();
oatmeal.id = 28;
oatmeal.name = "Haferflocken";
oatmeal.foodCategoryId = stapleFood.id;
oatmeal.imageId = 28;

const jam = new Ingredient();
jam.id = 29;
jam.name = "Marmelade";
jam.foodCategoryId = stapleFood.id;
jam.imageId = 29;

const butter = new Ingredient();
butter.id = 30;
butter.name = "Butter";
butter.foodCategoryId = chilledGoods.id;
butter.imageId = 30;

const milk = new Ingredient();
milk.id = 31;
milk.name = "Milch";
milk.foodCategoryId = chilledGoods.id;
milk.imageId = 31;

export {
    egg, oil, spinach, porkMeat, potato, sauerkraut, beef,
    noodle, ham, cheese, paprika, dough, tomatoSauce, salad,
    bun, onion, spaetzle, chips, chocolate, pistachios, pommes, wok,
    blackbread, icetea, orangejuice, water, zwieback, oatmeal, jam, butter, milk
};
