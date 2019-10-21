import { Errortext } from "../lib/models/Errortext";
import { severityEasy } from "./severities";

const errortext = new Errortext();
errortext.id = 1;
errortext.name = "Fehlertext";
errortext.text = "Dies ist ein Fehlertext";
errortext.severityId = severityEasy.id;

export { errortext };