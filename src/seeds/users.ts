import moment from "moment";
import { Gender } from "serious-game-library/dist/enums/Gender";
import { Roles } from "serious-game-library/dist/enums/Roles";
import { Status } from "serious-game-library/dist/enums/Status";
import { Patient } from "serious-game-library/dist/models/Patient";
import { Therapist } from "serious-game-library/dist/models/Therapist";
import { generatePasswordResetToken } from "../util/password/passwordHelper";

// valid admin therapist
const validAdminTherapist = new Therapist();
validAdminTherapist.id = 1;
validAdminTherapist.email = "therapist@example.org";
// tslint:disable-next-line:no-hardcoded-credentials no-duplicate-string
validAdminTherapist.password = "$2y$12$yEETx0N9Rod3tZMeWBfb1enEdjIE19SUWCf4qpiosCX3w.SeDwCZu";
validAdminTherapist.forename = "Max";
validAdminTherapist.lastname = "Mustermann";
validAdminTherapist.gender = Gender.MALE;
validAdminTherapist.failedLoginAttempts = 1;
validAdminTherapist.status = Status.ACTIVE;
validAdminTherapist.role = Roles.ADMIN;
validAdminTherapist.accepted = true;

// valid user therapist
const validTherapist = new Therapist();
validTherapist.id = 2;
validTherapist.email = "therapist1@example.org";
// tslint:disable-next-line:no-hardcoded-credentials
validTherapist.password = "$2y$12$yEETx0N9Rod3tZMeWBfb1enEdjIE19SUWCf4qpiosCX3w.SeDwCZu";
validTherapist.forename = "Tom";
validTherapist.lastname = "Atkins";
validTherapist.gender = Gender.MALE;
validTherapist.failedLoginAttempts = 0;
validTherapist.status = Status.ACTIVE;
validTherapist.role = Roles.USER;
validTherapist.accepted = true;
validTherapist.resetcode = generatePasswordResetToken(8);
validTherapist.resetcodeValidUntil = moment().add(8, "hours").toDate();

// unaccepted therapist
const unacceptedTherapist = new Therapist();
unacceptedTherapist.id = 3;
unacceptedTherapist.email = "therapist2@example.org";
// tslint:disable-next-line:no-hardcoded-credentials
unacceptedTherapist.password = "$2y$12$yEETx0N9Rod3tZMeWBfb1enEdjIE19SUWCf4qpiosCX3w.SeDwCZu";
unacceptedTherapist.forename = "Erika";
unacceptedTherapist.lastname = "Mustermann";
unacceptedTherapist.gender = Gender.FEMALE;
unacceptedTherapist.failedLoginAttempts = 0;
unacceptedTherapist.status = Status.ACTIVE;
unacceptedTherapist.role = Roles.ADMIN;
unacceptedTherapist.accepted = false;
unacceptedTherapist.resetcode = generatePasswordResetToken(8);

// therapist with login cooldown
const lockedTherapist = new Therapist();
lockedTherapist.id = 4;
lockedTherapist.email = "therapist3@example.org";
// tslint:disable-next-line:no-hardcoded-credentials
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
tooManyFailedLoginAttemptsTherapist.id = 5;
tooManyFailedLoginAttemptsTherapist.email = "therapist4@example.org";
// tslint:disable-next-line:no-hardcoded-credentials
tooManyFailedLoginAttemptsTherapist.password = "$2y$12$yEETx0N9Rod3tZMeWBfb1enEdjIE19SUWCf4qpiosCX3w.SeDwCZu";
tooManyFailedLoginAttemptsTherapist.forename = "Mario";
tooManyFailedLoginAttemptsTherapist.lastname = "Müller";
tooManyFailedLoginAttemptsTherapist.gender = Gender.MALE;
tooManyFailedLoginAttemptsTherapist.failedLoginAttempts = 10;
tooManyFailedLoginAttemptsTherapist.status = Status.ACTIVE;
tooManyFailedLoginAttemptsTherapist.role = Roles.ADMIN;
tooManyFailedLoginAttemptsTherapist.accepted = true;

// valid patient with valid password reset token
const validPatient = new Patient();
validPatient.id = 6;
validPatient.email = "patient@example.org";
// tslint:disable-next-line:no-hardcoded-credentials
validPatient.password = "$2y$12$yEETx0N9Rod3tZMeWBfb1enEdjIE19SUWCf4qpiosCX3w.SeDwCZu";
validPatient.forename = "Patient";
validPatient.lastname = "Patient";
validPatient.gender = Gender.MALE;
validPatient.failedLoginAttempts = 0;
validPatient.status = Status.ACTIVE;
validPatient.birthday = new Date();
validPatient.info = "Testinfo";
validPatient.resetcode = generatePasswordResetToken(8);
validPatient.resetcodeValidUntil = moment().add(1, "day").toDate();

// valid patient
const validPatient1 = new Patient();
validPatient1.id = 7;
validPatient1.email = "patient.name@example.org";
// tslint:disable-next-line:no-hardcoded-credentials
validPatient1.password = "$2y$12$yEETx0N9Rod3tZMeWBfb1enEdjIE19SUWCf4qpiosCX3w.SeDwCZu";
validPatient1.forename = "Patient";
validPatient1.lastname = "Patient";
validPatient1.gender = Gender.FEMALE;
validPatient1.failedLoginAttempts = 0;
validPatient1.status = Status.ACTIVE;
validPatient1.birthday = new Date();
validPatient1.info = "Testinfo";
validPatient1.resetcode = generatePasswordResetToken(8);
validPatient1.resetcodeValidUntil = moment().subtract(1, "day").toDate();

export {
    validAdminTherapist, validTherapist, unacceptedTherapist, lockedTherapist, tooManyFailedLoginAttemptsTherapist,
    validPatient, validPatient1
};
