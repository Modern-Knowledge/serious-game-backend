import { HelptextGame } from "../lib/models/HelptextGame";
import {game, game2, game3, game4} from "./games";
import {helptext, helptext1, helptext2, helptext3} from "./helptexts";

const helptextGames = new HelptextGame();
helptextGames.gameId = game2.id;
helptextGames.helptextId = helptext1.id;

const helptextGames1 = new HelptextGame();
helptextGames1.gameId = game.id;
helptextGames1.helptextId = helptext.id;

const helptextGames2 = new HelptextGame();
helptextGames2.gameId = game3.id;
helptextGames2.helptextId = helptext2.id;

const helptextGames3 = new HelptextGame();
helptextGames3.gameId = game4.id;
helptextGames3.helptextId = helptext3.id;

export { helptextGames, helptextGames1, helptextGames2, helptextGames3 };
