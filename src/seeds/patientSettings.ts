import { validPatient } from "./users";
import { PatientSetting } from "../lib/models/PatientSetting";

const pSettings = new PatientSetting();
pSettings.neglect = true;
pSettings.patientId = validPatient.id;

export { pSettings };