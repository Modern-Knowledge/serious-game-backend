import { ErrortextGame } from "../lib/models/ErrortextGame";
import { errortext, errortext1 } from "./errortexts";
import { game } from "./games";

const errortextGames = new ErrortextGame();
errortextGames.gameId = game.id;
errortextGames.errorId = errortext.id;

const errortextGames1 = new ErrortextGame();
errortextGames1.gameId = game.id;
errortextGames1.errorId = errortext1.id;

export { errortextGames, errortextGames1 };
