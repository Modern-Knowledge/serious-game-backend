import { Severity } from "../lib/models/Severity";
import { Severities } from "../lib/enums/Severities";

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