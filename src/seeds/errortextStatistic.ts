import { ErrortextStatistic } from "../lib/models/ErrortextStatistic";
import { fridgeNotCheckedError, itemAlreadyInFridgeError, mealtimeError, shoppingCartError } from "./errortexts";
import { statistic } from "./statistics";

const mealtimeErrorTextGamesStatistic = new ErrortextStatistic();
mealtimeErrorTextGamesStatistic.statisticId = statistic.id;
mealtimeErrorTextGamesStatistic.errortextId = mealtimeError.id;

const shoppingCartErrorTextGamesStatistic = new ErrortextStatistic();
shoppingCartErrorTextGamesStatistic.statisticId = statistic.id;
shoppingCartErrorTextGamesStatistic.errortextId = shoppingCartError.id;

const fridgeNotCheckedErrorTextGamesStatistic = new ErrortextStatistic();
fridgeNotCheckedErrorTextGamesStatistic.statisticId = statistic.id;
fridgeNotCheckedErrorTextGamesStatistic.errortextId = fridgeNotCheckedError.id;

const itemAlreadyInFridgeErrorTextGamesStatistic = new ErrortextStatistic();
itemAlreadyInFridgeErrorTextGamesStatistic.statisticId = statistic.id;
itemAlreadyInFridgeErrorTextGamesStatistic.errortextId =
  itemAlreadyInFridgeError.id;
export {
  mealtimeErrorTextGamesStatistic,
  shoppingCartErrorTextGamesStatistic,
  fridgeNotCheckedErrorTextGamesStatistic,
  itemAlreadyInFridgeErrorTextGamesStatistic
};
