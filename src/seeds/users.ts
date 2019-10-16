import { Therapist } from "../lib/models/Therapist";
import { Gender } from "../lib/enums/Gender";
import { Status } from "../lib/enums/Status";
import { Roles } from "../lib/enums/Roles";
import moment from "moment";
import { Patient } from "../lib/models/Patient";

// valid admin therapist
const validAdminTherapist = new Therapist();
validAdminTherapist.email = "therapist@example.org";
validAdminTherapist.password = "$2y$12$yEETx0N9Rod3tZMeWBfb1enEdjIE19SUWCf4qpiosCX3w.SeDwCZu";
validAdminTherapist.forename = "Max";
validAdminTherapist.lastname = "Mustermann";
validAdminTherapist.gender = Gender.MALE;
validAdminTherapist.failedLoginAttempts = 0;
validAdminTherapist.status = Status.ACTIVE;
validAdminTherapist.role = Roles.ADMIN;
validAdminTherapist.accepted = true;

// valid user therapist
const validTherapist = new Therapist();
validTherapist.email = "therapist1@example.org";
validTherapist.password = "$2y$12$yEETx0N9Rod3tZMeWBfb1enEdjIE19SUWCf4qpiosCX3w.SeDwCZu";
validTherapist.forename = "Tom";
validTherapist.lastname = "Atkins";
validTherapist.gender = Gender.MALE;
validTherapist.failedLoginAttempts = 0;
validTherapist.status = Status.ACTIVE;
validTherapist.role = Roles.USER;
validTherapist.accepted = true;

// unaccepted therapist
const unacceptedTherapist = new Therapist();
unacceptedTherapist.email = "therapist2@example.org";
unacceptedTherapist.password = "$2y$12$yEETx0N9Rod3tZMeWBfb1enEdjIE19SUWCf4qpiosCX3w.SeDwCZu";
unacceptedTherapist.forename = "Erika";
unacceptedTherapist.lastname = "Mustermann";
unacceptedTherapist.gender = Gender.FEMALE;
unacceptedTherapist.failedLoginAttempts = 0;
unacceptedTherapist.status = Status.ACTIVE;
unacceptedTherapist.role = Roles.ADMIN;
unacceptedTherapist.accepted = false;

// therapist with login cooldown
const lockedTherapist = new Therapist();
lockedTherapist.email = "therapist3@example.org";
lockedTherapist.password = "$2y$12$yEETx0N9Rod3tZMeWBfb1enEdjIE19SUWCf4qpiosCX3w.SeDwCZu";
lockedTherapist.forename = "John";
lockedTherapist.lastname = "Doe";
lockedTherapist.gender = Gender.MALE;
lockedTherapist.failedLoginAttempts = 0;
lockedTherapist.status = Status.ACTIVE;
lockedTherapist.role = Roles.ADMIN;
lockedTherapist.accepted = true;
lockedTherapist.loginCoolDown = moment().add(1, "day").toDate();

// therapist with too much failed login attempts
const tooManyFailedLoginAttemptsTherapist = new Therapist();
tooManyFailedLoginAttemptsTherapist.email = "therapist4@example.org";
tooManyFailedLoginAttemptsTherapist.password = "$2y$12$yEETx0N9Rod3tZMeWBfb1enEdjIE19SUWCf4qpiosCX3w.SeDwCZu";
tooManyFailedLoginAttemptsTherapist.forename = "Mario";
tooManyFailedLoginAttemptsTherapist.lastname = "Müller";
tooManyFailedLoginAttemptsTherapist.gender = Gender.MALE;
tooManyFailedLoginAttemptsTherapist.failedLoginAttempts = 10;
tooManyFailedLoginAttemptsTherapist.status = Status.ACTIVE;
tooManyFailedLoginAttemptsTherapist.role = Roles.ADMIN;
tooManyFailedLoginAttemptsTherapist.accepted = true;

// valid patient
const validPatient = new Patient();
validPatient.email = "patient@example.org";
validPatient.password = "$2y$12$yEETx0N9Rod3tZMeWBfb1enEdjIE19SUWCf4qpiosCX3w.SeDwCZu";
validPatient.forename = "Patient";
validPatient.lastname = "Patient";
validPatient.gender = Gender.MALE;
validPatient.failedLoginAttempts = 0;
validPatient.status = Status.ACTIVE;
validPatient.birthday = new Date();
validPatient.info = "Testinfo";

export {
    validAdminTherapist, validTherapist, unacceptedTherapist, lockedTherapist, tooManyFailedLoginAttemptsTherapist,
    validPatient
};