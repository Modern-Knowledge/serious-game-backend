import { HelptextGame } from "../lib/models/HelptextGame";
import { game } from "./games";
import { helptext, helptext1 } from "./helptexts";

const helptextGames = new HelptextGame();
helptextGames.gameId = game.id;
helptextGames.helptextId = helptext.id;

const helptextGames1 = new HelptextGame();
helptextGames1.gameId = game.id;
helptextGames1.helptextId = helptext1.id;


export { helptextGames, helptextGames1 };