import { ErrortextStatistic } from "../lib/models/ErrortextStatistic";
import { statistic } from "./statistics";
import { errortext, errortext1 } from "./errortexts";

const errortextStatistic = new ErrortextStatistic();
errortextStatistic.statisticId = statistic.id;
errortextStatistic.errortextId = errortext.id;

const errortextStatistic1 = new ErrortextStatistic();
errortextStatistic1.statisticId = statistic.id;
errortextStatistic1.errortextId = errortext1.id;

export { errortextStatistic, errortextStatistic1 };