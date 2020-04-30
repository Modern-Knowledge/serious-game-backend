import { TherapistPatient } from "serious-game-library/dist/models/TherapistPatient";
import { validPatient, validPatient1, validTherapist } from "./users";

const therapistPatient1 = new TherapistPatient();
therapistPatient1.patientId = validPatient.id;
therapistPatient1.therapistId = validTherapist.id;

const therapistPatient2 = new TherapistPatient();
therapistPatient2.patientId = validPatient1.id;
therapistPatient2.therapistId = validTherapist.id;

export { therapistPatient1, therapistPatient2 };
