import { PatientSetting } from "../lib/models/PatientSetting";
import { validPatient } from "./users";

const pSettings = new PatientSetting();
pSettings.id = 1;
pSettings.neglect = true;
pSettings.patientId = validPatient.id;
pSettings.skipIntroduction = false;

export { pSettings };
