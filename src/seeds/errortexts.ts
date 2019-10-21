import { Errortext } from "../lib/models/Errortext";
import { Severities } from "../lib/enums/Severities";

const errortext = new Errortext();
errortext.name = "Fehlertext";
errortext.text = "Dies ist ein Fehlertext";
errortext.severityId = Severities.HIGH;

export { errortext };