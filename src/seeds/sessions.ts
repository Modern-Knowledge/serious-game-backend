import { Session } from "../lib/models/Session";
import { game } from "./games";
import { validPatient } from "./users";
import { statistic } from "./statistics";
import { gameSettings } from "./gameSettings";

const session = new Session();
session.id = 1;
session.gameId = game.id;
session.patientId = validPatient.id;
session.statisticId = statistic.id;
session.gameSettingId = gameSettings.id;
session.date = new Date();

export { session };