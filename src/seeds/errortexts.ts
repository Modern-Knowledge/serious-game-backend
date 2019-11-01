import { Errortext } from "../lib/models/Errortext";
import { severityEasy } from "./severities";

const errortext = new Errortext();
errortext.id = 1;
errortext.name = "Fehlertext";
errortext.text = "Dies ist ein Fehlertext";
errortext.severityId = severityEasy.id;

const errortext1 = new Errortext();
errortext1.id = 2;
errortext1.name = "Fehlertext 2";
errortext1.text = "Dies ist noch ein Fehlertext";
errortext1.severityId = severityEasy.id;

export { errortext };
