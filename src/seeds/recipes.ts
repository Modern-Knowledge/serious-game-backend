import { Mealtimes } from "serious-game-library/dist/enums/Mealtimes";
import { Recipe } from "serious-game-library/dist/models/Recipe";
import {difficultyEasy, difficultyHard, difficultyMedium} from "./difficulties";

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
roastPork.difficultyId = difficultyMedium.id;
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
pastaSalad.difficultyId = difficultyMedium.id;
pastaSalad.mealtime = Mealtimes.DINNER;

const pizza = new Recipe();
pizza.id = 5;
pizza.name = "Pizza";
pizza.description = "";
pizza.difficultyId = difficultyMedium.id;
pizza.mealtime = Mealtimes.DINNER;

const spaghetti = new Recipe();
spaghetti.id = 6;
spaghetti.name = "Spaghetti";
spaghetti.description = "Die Nudeln im Topf kochen und mit der Tomatensauce anrichten.";
spaghetti.difficultyId = difficultyEasy.id;
spaghetti.mealtime = Mealtimes.LUNCH;

const burger = new Recipe();
burger.id = 7;
burger.name = "Burger";
burger.description = "";
burger.difficultyId = difficultyMedium.id;
burger.mealtime = Mealtimes.DINNER;

const goulash = new Recipe();
goulash.id = 8;
goulash.name = "Gulasch";
goulash.description = "";
goulash.difficultyId = difficultyHard.id;
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
tafelspitz.difficultyId = difficultyMedium.id;
tafelspitz.mealtime = Mealtimes.LUNCH;

const musli = new Recipe();
musli.id = 11;
musli.name = "Müsli";
musli.description = "Das Müsli in die Schüssel geben und die Milch daraufgießen.";
musli.difficultyId = difficultyEasy.id;
musli.mealtime = Mealtimes.BREAKFAST;

const jamBread = new Recipe();
jamBread.id = 12;
jamBread.name = "Marmeladenbrot";
jamBread.description = "Das Brot mit Butter und Marmelade bestreichen.";
jamBread.difficultyId = difficultyMedium.id;
jamBread.mealtime = Mealtimes.BREAKFAST;

export {
    scrambledEgg, roastPork, schnitzel, pastaSalad, burger,
    pizza, spaghetti, goulash, cheeseNoodles, tafelspitz, musli,
    jamBread
};
