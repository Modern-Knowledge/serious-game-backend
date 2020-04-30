import { Severities } from "serious-game-library/dist/enums/Severities";
import { Severity } from "serious-game-library/dist/models/Severity";

const severityEasy = new Severity();
severityEasy.id = 1;
severityEasy.severity = Severities.LOW;

const severityMedium = new Severity();
severityEasy.id = 2;
severityMedium.severity = Severities.MEDIUM;

const severityHard = new Severity();
severityEasy.id = 3;
severityHard.severity = Severities.HIGH;

export { severityEasy, severityMedium, severityHard };
