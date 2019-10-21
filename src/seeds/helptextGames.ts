import { HelptextGame } from "../lib/models/HelptextGame";
import { game } from "./games";
import { helptext } from "./helptexts";

const helptextGames = new HelptextGame();
helptextGames.gameId = game.id;
helptextGames.helptextId = helptext.id;


export { helptextGames };