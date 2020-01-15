import { Mealtimes } from "../lib/enums/Mealtimes";
import { Recipe } from "../lib/models/Recipe";
import { difficultyEasy } from "./difficulties";

const scrambledEgg = new Recipe();
scrambledEgg.id = 1;
scrambledEgg.name = "Rührei";
scrambledEgg.description =
  "Die Eier zerschlagen und in der Pfanne ca. 10 Minuten braten lassen.";
scrambledEgg.difficultyId = difficultyEasy.id;
scrambledEgg.mealtime = Mealtimes.BREAKFAST;

const roastPork = new Recipe();
roastPork.id = 2;
roastPork.name = "Schweinsbraten";
roastPork.description = "";
roastPork.difficultyId = difficultyEasy.id;
roastPork.mealtime = Mealtimes.LUNCH;

const schnitzel = new Recipe();
schnitzel.id = 3;
schnitzel.name = "Schnitzel";
schnitzel.description = "";
schnitzel.difficultyId = difficultyEasy.id;
schnitzel.mealtime = Mealtimes.LUNCH;

const pastaSalad = new Recipe();
pastaSalad.id = 4;
pastaSalad.name = "Nudelsalat";
pastaSalad.description = "";
pastaSalad.difficultyId = difficultyEasy.id;
pastaSalad.mealtime = Mealtimes.LUNCH;

const pizza = new Recipe();
pizza.id = 5;
pizza.name = "Pizza";
pizza.description = "";
pizza.difficultyId = difficultyEasy.id;
pizza.mealtime = Mealtimes.LUNCH;

const spaghetti = new Recipe();
spaghetti.id = 6;
spaghetti.name = "Spagetthi";
spaghetti.description = "";
spaghetti.difficultyId = difficultyEasy.id;
spaghetti.mealtime = Mealtimes.LUNCH;

const burger = new Recipe();
burger.id = 7;
burger.name = "Burger";
burger.description = "";
burger.difficultyId = difficultyEasy.id;
burger.mealtime = Mealtimes.LUNCH;

const goulash = new Recipe();
goulash.id = 8;
goulash.name = "Gulasch";
goulash.description = "";
goulash.difficultyId = difficultyEasy.id;
goulash.mealtime = Mealtimes.LUNCH;

const cheeseNoodles = new Recipe();
cheeseNoodles.id = 9;
cheeseNoodles.name = "Käsespätzle";
cheeseNoodles.description = "";
cheeseNoodles.difficultyId = difficultyEasy.id;
cheeseNoodles.mealtime = Mealtimes.LUNCH;

const tafelspitz = new Recipe();
tafelspitz.id = 10;
tafelspitz.name = "Tafelspitz";
tafelspitz.description = "";
tafelspitz.difficultyId = difficultyEasy.id;
tafelspitz.mealtime = Mealtimes.LUNCH;

export {
    scrambledEgg, roastPork, schnitzel, pastaSalad, burger,
    pizza, spaghetti, goulash, cheeseNoodles, tafelspitz
};
