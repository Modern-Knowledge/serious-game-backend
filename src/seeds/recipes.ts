import { Recipe } from "../lib/models/Recipe";
import { difficultyEasy } from "./difficulties";

const scrambledEgg = new Recipe();
scrambledEgg.name = "Rührei";
scrambledEgg.description = "Die Eier zerschlagen und in der Pfanne ca. 10 Minuten braten lassen.";
scrambledEgg.difficultyId = difficultyEasy.id;

const roastPork = new Recipe();
roastPork.name = "Schweinsbraten";
roastPork.description = "";
roastPork.difficultyId = difficultyEasy.id;

const proteinShake = new Recipe();
proteinShake.name = "Thunfisch-Proteinshake";
proteinShake.description = "Thunfisch und Whey Isolat in den Mixer und 5 Sekunden mixen. Danach kühl genießen.";
proteinShake.difficultyId = difficultyEasy.id;

export { scrambledEgg, roastPork, proteinShake };