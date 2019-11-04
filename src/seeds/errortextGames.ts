import { game } from "./games";
import { ErrortextGame } from "../lib/models/ErrortextGame";
import { errortext } from "./errortexts";

const errortextGames = new ErrortextGame();
errortextGames.gameId = game.id;
errortextGames.errorId = errortext.id;


export { errortextGames };