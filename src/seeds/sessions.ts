import { Session } from "serious-game-library/dist/models/Session";
import { game } from "./games";
import { gameSettings } from "./gameSettings";
import { statistic } from "./statistics";
import { validPatient } from "./users";

const session = new Session();
session.id = 1;
session.gameId = game.id;
session.patientId = validPatient.id;
session.statisticId = statistic.id;
session.gameSettingId = gameSettings.id;
session.date = new Date();

export { session };
