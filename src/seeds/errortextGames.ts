import { ErrortextGame } from "serious-game-library/dist/models/ErrortextGame";
import {
  dayPlanningError,
  fridgeNotCheckedError,
  itemAlreadyInFridgeError,
  mealtimeError,
  mealtimeFilledError,
  shoppingCartError,
  shoppingListError,
} from "./errortexts";
import { game, game3, game4 } from "./games";

const mealtimeErrorTextGames = new ErrortextGame();
mealtimeErrorTextGames.gameId = game.id;
mealtimeErrorTextGames.errorId = mealtimeError.id;

const mealtimeFilledErrorTextGames = new ErrortextGame();
mealtimeFilledErrorTextGames.gameId = game.id;
mealtimeFilledErrorTextGames.errorId = mealtimeFilledError.id;

const shoppingCartErrorTextGames = new ErrortextGame();
shoppingCartErrorTextGames.gameId = game4.id;
shoppingCartErrorTextGames.errorId = shoppingCartError.id;

const fridgeNotCheckedErrorTextGames = new ErrortextGame();
fridgeNotCheckedErrorTextGames.gameId = game3.id;
fridgeNotCheckedErrorTextGames.errorId = fridgeNotCheckedError.id;

const itemAlreadyInFridgeErrorTextGames = new ErrortextGame();
itemAlreadyInFridgeErrorTextGames.gameId = game3.id;
itemAlreadyInFridgeErrorTextGames.errorId = itemAlreadyInFridgeError.id;

const shoppingListErrorTextGames = new ErrortextGame();
shoppingListErrorTextGames.gameId = game3.id;
shoppingListErrorTextGames.errorId = shoppingListError.id;

const dayPlanningErrorTextGames = new ErrortextGame();
dayPlanningErrorTextGames.gameId = game.id;
dayPlanningErrorTextGames.errorId = dayPlanningError.id;

export {
    mealtimeErrorTextGames,
    mealtimeFilledErrorTextGames,
    shoppingCartErrorTextGames,
    fridgeNotCheckedErrorTextGames,
    itemAlreadyInFridgeErrorTextGames,
    shoppingListErrorTextGames,
    dayPlanningErrorTextGames
};
