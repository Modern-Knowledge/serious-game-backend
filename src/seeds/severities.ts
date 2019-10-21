import { Severity } from "../lib/models/Severity";
import { Severities } from "../lib/enums/Severities";

const severityEasy = new Severity();
severityEasy.severity = Severities.LOW;

const severityMedium = new Severity();
severityMedium.severity = Severities.MEDIUM;

const severityHard = new Severity();
severityHard.severity = Severities.HIGH;

export { severityEasy, severityMedium, severityHard };