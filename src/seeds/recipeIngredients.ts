import { RecipeIngredient } from "serious-game-library/dist/models/RecipeIngredient";
import {
    beef, blackbread, bun, butter,
    cheese,
    dough,
    egg,
    ham, jam, milk,
    noodle, oatmeal,
    oil, onion,
    paprika,
    porkMeat,
    potato, salad,
    sauerkraut, spaetzle, spinach,
    tomatoSauce
} from "./ingredients";
import {
    burger,
    cheeseNoodles,
    goulash, jamBread, musli,
    pastaSalad,
    pizza,
    roastPork,
    schnitzel,
    scrambledEgg,
    spaghetti, tafelspitz
} from "./recipes";

const recipeIngredient1 = new RecipeIngredient();
recipeIngredient1.recipeId = scrambledEgg.id;
recipeIngredient1.ingredientId = egg.id;

const recipeIngredient2 = new RecipeIngredient();
recipeIngredient2.recipeId = scrambledEgg.id;
recipeIngredient2.ingredientId = oil.id;

// --------------------------------------------------

const recipeIngredient3 = new RecipeIngredient();
recipeIngredient3.recipeId = roastPork.id;
recipeIngredient3.ingredientId = porkMeat.id;

const recipeIngredient4 = new RecipeIngredient();
recipeIngredient4.recipeId = roastPork.id;
recipeIngredient4.ingredientId = potato.id;

const recipeIngredient5 = new RecipeIngredient();
recipeIngredient5.recipeId = roastPork.id;
recipeIngredient5.ingredientId = sauerkraut.id;

// --------------------------------------------------

const recipeIngredient6 = new RecipeIngredient();
recipeIngredient6.recipeId = schnitzel.id;
recipeIngredient6.ingredientId = beef.id;

const recipeIngredient7 = new RecipeIngredient();
recipeIngredient7.recipeId = schnitzel.id;
recipeIngredient7.ingredientId = oil.id;

// --------------------------------------------------

const recipeIngredient8 = new RecipeIngredient();
recipeIngredient8.recipeId = pastaSalad.id;
recipeIngredient8.ingredientId = noodle.id;

const recipeIngredient9 = new RecipeIngredient();
recipeIngredient9.recipeId = pastaSalad.id;
recipeIngredient9.ingredientId = ham.id;

const recipeIngredient10 = new RecipeIngredient();
recipeIngredient10.recipeId = pastaSalad.id;
recipeIngredient10.ingredientId = cheese.id;

const recipeIngredient11 = new RecipeIngredient();
recipeIngredient11.recipeId = pastaSalad.id;
recipeIngredient11.ingredientId = paprika.id;

// --------------------------------------------------

const recipeIngredient12 = new RecipeIngredient();
recipeIngredient12.recipeId = pizza.id;
recipeIngredient12.ingredientId = dough.id;

const recipeIngredient13 = new RecipeIngredient();
recipeIngredient13.recipeId = pizza.id;
recipeIngredient13.ingredientId = ham.id;

const recipeIngredient14 = new RecipeIngredient();
recipeIngredient14.recipeId = pizza.id;
recipeIngredient14.ingredientId = tomatoSauce.id;

const recipeIngredient15 = new RecipeIngredient();
recipeIngredient15.recipeId = pizza.id;
recipeIngredient15.ingredientId = cheese.id;

// --------------------------------------------------

const recipeIngredient16 = new RecipeIngredient();
recipeIngredient16.recipeId = spaghetti.id;
recipeIngredient16.ingredientId = noodle.id;

const recipeIngredient17 = new RecipeIngredient();
recipeIngredient17.recipeId = spaghetti.id;
recipeIngredient17.ingredientId = tomatoSauce.id;

// --------------------------------------------------

const recipeIngredient18 = new RecipeIngredient();
recipeIngredient18.recipeId = burger.id;
recipeIngredient18.ingredientId = beef.id;

const recipeIngredient19 = new RecipeIngredient();
recipeIngredient19.recipeId = burger.id;
recipeIngredient19.ingredientId = cheese.id;

const recipeIngredient20 = new RecipeIngredient();
recipeIngredient20.recipeId = burger.id;
recipeIngredient20.ingredientId = salad.id;

const recipeIngredient21 = new RecipeIngredient();
recipeIngredient21.recipeId = burger.id;
recipeIngredient21.ingredientId = bun.id;

// --------------------------------------------------

const recipeIngredient22 = new RecipeIngredient();
recipeIngredient22.recipeId = goulash.id;
recipeIngredient22.ingredientId = potato.id;

const recipeIngredient23 = new RecipeIngredient();
recipeIngredient23.recipeId = goulash.id;
recipeIngredient23.ingredientId = porkMeat.id;

const recipeIngredient24 = new RecipeIngredient();
recipeIngredient24.recipeId = goulash.id;
recipeIngredient24.ingredientId = onion.id;

const recipeIngredient25 = new RecipeIngredient();
recipeIngredient25.recipeId = goulash.id;
recipeIngredient25.ingredientId = tomatoSauce.id;

// --------------------------------------------------

const recipeIngredient26 = new RecipeIngredient();
recipeIngredient26.recipeId = cheeseNoodles.id;
recipeIngredient26.ingredientId = spaetzle.id;

const recipeIngredient27 = new RecipeIngredient();
recipeIngredient27.recipeId = cheeseNoodles.id;
recipeIngredient27.ingredientId = cheese.id;

// --------------------------------------------------

const recipeIngredient28 = new RecipeIngredient();
recipeIngredient28.recipeId = tafelspitz.id;
recipeIngredient28.ingredientId = spinach.id;

const recipeIngredient29 = new RecipeIngredient();
recipeIngredient29.recipeId = tafelspitz.id;
recipeIngredient29.ingredientId = onion.id;

const recipeIngredient30 = new RecipeIngredient();
recipeIngredient30.recipeId = tafelspitz.id;
recipeIngredient30.ingredientId = beef.id;

// --------------------------------------------------

const recipeIngredient31 = new RecipeIngredient();
recipeIngredient31.recipeId = musli.id;
recipeIngredient31.ingredientId = milk.id;

const recipeIngredient32 = new RecipeIngredient();
recipeIngredient32.recipeId = musli.id;
recipeIngredient32.ingredientId = oatmeal.id;

// --------------------------------------------------

const recipeIngredient33 = new RecipeIngredient();
recipeIngredient33.recipeId = jamBread.id;
recipeIngredient33.ingredientId = blackbread.id;

const recipeIngredient34 = new RecipeIngredient();
recipeIngredient34.recipeId = jamBread.id;
recipeIngredient34.ingredientId = butter.id;

const recipeIngredient35 = new RecipeIngredient();
recipeIngredient35.recipeId = jamBread.id;
recipeIngredient35.ingredientId = jam.id;

// --------------------------------------------------

export {
    recipeIngredient1, recipeIngredient2, recipeIngredient3,
    recipeIngredient4, recipeIngredient5, recipeIngredient6,
    recipeIngredient7, recipeIngredient8, recipeIngredient9,
    recipeIngredient10, recipeIngredient11, recipeIngredient12,
    recipeIngredient13, recipeIngredient14, recipeIngredient15,
    recipeIngredient16, recipeIngredient17, recipeIngredient18,
    recipeIngredient19, recipeIngredient20, recipeIngredient21,
    recipeIngredient22, recipeIngredient23, recipeIngredient24,
    recipeIngredient25, recipeIngredient26, recipeIngredient27,
    recipeIngredient28, recipeIngredient29, recipeIngredient30,
    recipeIngredient31, recipeIngredient32, recipeIngredient33,
    recipeIngredient34, recipeIngredient35,
};
