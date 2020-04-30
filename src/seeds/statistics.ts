import moment from "moment";
import { Statistic } from "serious-game-library/dist/models/Statistic";

const statistic = new Statistic();
statistic.id = 1;
statistic.startTime = new Date();
statistic.endTime = moment().add(1, "day").toDate();

const statistic1 = new Statistic();
statistic1.id = 2;
statistic1.startTime = new Date();
statistic1.endTime = moment().add(1, "day").toDate();

export { statistic, statistic1 };
