import { ErrortextStatistic } from "../lib/models/ErrortextStatistic";
import {
  fridgeNotCheckedError,
  itemAlreadyInFridgeError,
  mealtimeError,
  mealtimeFilledError,
  shoppingCartError,
  shoppingListError,
  dayPlanningError,
} from "./errortexts";
import { statistic } from "./statistics";

const mealtimeErrorTextGamesStatistic = new ErrortextStatistic();
mealtimeErrorTextGamesStatistic.statisticId = statistic.id;
mealtimeErrorTextGamesStatistic.errortextId = mealtimeError.id;

const mealtimeFilledErrorTextGamesStatistic = new ErrortextStatistic();
mealtimeFilledErrorTextGamesStatistic.statisticId = statistic.id;
mealtimeFilledErrorTextGamesStatistic.errortextId = mealtimeFilledError.id;

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

const shoppingListErrorTextGamesStatistic = new ErrortextStatistic();
shoppingListErrorTextGamesStatistic.statisticId = statistic.id;
shoppingListErrorTextGamesStatistic.errortextId = shoppingListError.id;

const dayPlanningErrorTextGamesStatistic = new ErrortextStatistic();
dayPlanningErrorTextGamesStatistic.statisticId = statistic.id;
dayPlanningErrorTextGamesStatistic.errortextId = dayPlanningError.id;

export {
    mealtimeErrorTextGamesStatistic,
    mealtimeFilledErrorTextGamesStatistic,
    shoppingCartErrorTextGamesStatistic,
    fridgeNotCheckedErrorTextGamesStatistic,
    itemAlreadyInFridgeErrorTextGamesStatistic,
    shoppingListErrorTextGamesStatistic,
    dayPlanningErrorTextGamesStatistic
};
