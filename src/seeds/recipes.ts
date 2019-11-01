import { Recipe } from "../lib/models/Recipe";
import { difficultyEasy } from "./difficulties";
import { Mealtimes } from "../lib/enums/Mealtimes";

const scrambledEgg = new Recipe();
scrambledEgg.id = 1;
scrambledEgg.name = "Rührei";
scrambledEgg.description =
  "Die Eier zerschlagen und in der Pfanne ca. 10 Minuten braten lassen.";
scrambledEgg.difficultyId = difficultyEasy.id;
scrambledEgg.mealtime = Mealtimes.BREAKFAST;

const roastPork = new Recipe();
scrambledEgg.id = 2;
roastPork.name = "Schweinsbraten";
roastPork.description = "";
roastPork.difficultyId = difficultyEasy.id;
roastPork.mealtime = Mealtimes.LUNCH;

const proteinShake = new Recipe();
scrambledEgg.id = 3;
proteinShake.name = "Thunfisch-Proteinshake";
proteinShake.description =
  "Thunfisch und Whey Isolat in den Mixer und 5 Sekunden mixen. Danach kühl genießen.";
proteinShake.difficultyId = difficultyEasy.id;
proteinShake.mealtime = Mealtimes.DINNER;

export { scrambledEgg, roastPork, proteinShake };
