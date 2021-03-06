import * as bcrypt from "bcryptjs";
import { Status } from "serious-game-library/dist/enums/Status";
import { HttpResponseMessageSeverity } from "serious-game-library/dist/utils/http/HttpResponse";
import request from "supertest";
import app from "../../src/app";
import { PatientSettingFacade } from "../../src/db/entity/settings/PatientSettingFacade";
import { PatientFacade } from "../../src/db/entity/user/PatientFacade";
import { seedUsers, truncateTables } from "../../src/migrationHelper";
import { validPatient, validPatient1, validTherapist } from "../../src/seeds/users";
import { authenticate, containsMessage } from "../../src/util/testhelper";

const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwi" +
    "ZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWx" +
    "zZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qv" +
    "VSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

describe("PatientController Tests", () => {

    describe("GET /patients", () => {
        const timeout = 100000;
        const endpoint = "/patients";
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
        }, timeout);

        // SGBPC01
        it("fetch all patients", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("patients");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();
        }, timeout);

        // SGBPC02
        it("try to fetch all patients without authentication", async () => {
            const res = await request(app).get(endpoint)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPC03
        it("try to fetch all patients with expired token", async () => {
            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + expiredToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);
    });

    describe("POST /patients", () => {
        const timeout = 100000;
        const endpoint = "/patients";

        beforeEach(async () => {
            await truncateTables();
            await seedUsers();
        }, timeout);

        // SGBPC04
        it("register new patient with correct data", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newPatient@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        therapist: "false"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(201);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("user");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            const patientId = res.body._data.user._id;

            const patientFacade = new PatientFacade();
            const patient = await patientFacade.getById(patientId);

            expect(patient).not.toBeUndefined();

            if (patient) {
                expect(patient.failedLoginAttempts).toEqual(0);
                expect(patient.status).toEqual(Status.ACTIVE);

                const compPasswords = bcrypt.compareSync("123456", patient.password);
                expect(compPasswords).toBeTruthy();
            }

            const pId = res.body._data.user._id;
            const patientSettingFacade = new PatientSettingFacade();
            patientSettingFacade.filter.addFilterCondition("patient_id", pId);
            const patientSetting = await patientSettingFacade.getOne();

            expect(patientSetting).not.toBeUndefined();

            if (patientSetting) {
                expect(patient.id).toEqual(patientSetting.patientId);
            }

        }, timeout);

        // SGBPC05
        it("try to register patient with invalid email", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "invalidEmail",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        therapist: "false"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPC06
        it("try to register patient with already existing email", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: validPatient.email,
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        therapist: "false"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPC07
        it("try to register patient where password and password_confirmation do not match", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newPatient@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "1234567",
                        therapist: "false"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPC08
        it("try to register patient with password that is too short", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newPatient@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "12345",
                        password_confirmation: "12345",
                        therapist: "false"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 2)).toBeTruthy();
        }, timeout);

        // SGBPC09
        it("try to register a new patient where therapist flag ist set to true", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newPatient@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        therapist: "true"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPC10
        it("try to register a new patient without the therapist flag", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newPatient@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newPatient@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        therapist: ""
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPC11
        it("try to register a new patient without an email", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        therapist: "false"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).post(endpoint)
                .send(
                    {
                        _email: "",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        therapist: "false"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBPC12
        it("try to register a new patient without a forename", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newPatient@mail.com",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        therapist: "false"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newTherapist@mail.com",
                        _forename: "",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        therapist: "false"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBPC13
        it("try to register a new patient without a lastname", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newTherapist@mail.com",
                        _forename: "Vorname",
                        _password: "123456",
                        password_confirmation: "123456",
                        therapist: "false"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newTherapist@mail.com",
                        _forename: "Vorname",
                        _lastname: "",
                        _password: "123456",
                        password_confirmation: "123456",
                        therapist: "false"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBPC14
        it("try to register a new patient without a password", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newTherapist@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        password_confirmation: "123456",
                        therapist: "false"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBPC15
        it("try to register a new patient without a password_confirmation", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newTherapist@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        therapist: "false"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newTherapist@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "",
                        therapist: "false"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBPC16
        it("try to register a new patient without any data", async () => {
            const res = await request(app).post(endpoint)
                .send()
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 6)).toBeTruthy();

            const res1 = await request(app).post(endpoint)
                .send(
                    {
                        _email: "",
                        _forename: "",
                        _lastname: "",
                        _password: "",
                        password_confirmation: "",
                        therapist: ""
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 6)).toBeTruthy();

        }, timeout);
    });

    describe("DELETE /patients/:id", () => {
        const endpoint = "/patients";
        const timeout = 10000;
        let authenticationToken: string;

        beforeEach(async () => {
            await truncateTables();
            await seedUsers();
        }, timeout);

        // SGBPC17
        it("successfully delete patient", async () => {
            authenticationToken = await authenticate(validPatient);

            const res = await request(app).delete(endpoint + "/" + validPatient.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            // check if patient was deleted
            const patientFacade = new PatientFacade();
            const patient = await patientFacade.getById(validPatient.id);
            expect(patient).toBeUndefined();

        }, timeout);

        // SGBPC18
        it("try to delete patient without authentication", async () => {
            const res = await request(app).delete(endpoint + "/" + validPatient.id)
                .set("Authorization", "")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBPC19
        it("try to delete patient with an expired token", async () => {
            const res = await request(app).delete(endpoint + "/" + validPatient.id)
                .set("Authorization", "Bearer " + expiredToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPC20
        it("try to delete other patient", async () => {
            authenticationToken = await authenticate(validPatient);

            const res = await request(app).delete(endpoint + "/" + validPatient1.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPC21
        it("try to delete patient authenticated as therapist", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).delete(endpoint + "/" + validPatient.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPC22
        it("try to delete patient without an id", async () => {
            authenticationToken = await authenticate(validPatient);

            const res = await request(app).delete(endpoint + "/")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("error");
        }, timeout);

        // SGBPC23
        it("try to delete patient without an invalid id", async () => {
            authenticationToken = await authenticate(validPatient);

            const res = await request(app).delete(endpoint + "/invalid")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);
    });

    describe("PUT /patients/:id", () => {
        const timeout = 100000;
        const endpoint = "/patients";
        let authenticationToken;

        beforeEach(async () => {
            await truncateTables();
            await seedUsers();
        }, timeout);

        // SGBPC24
        it("successfully update patient", async () => {
            authenticationToken = await authenticate(validPatient);

            const res = await request(app).put(endpoint + "/" + validPatient.id)
                .send(
                    {
                        _email: "new.patient@mail.com",
                        _forename: "Neuer Vorname",
                        _lastname: "Neuer Nachname",
                        _info: "Test info"
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("patient");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            const patientId = res.body._data.patient._id;

            const patientFacade = new PatientFacade();
            const patient = await patientFacade.getById(patientId);

            expect(patient).not.toBeUndefined();

            if (patient) {
                expect(patient.email).toEqual("new.patient@mail.com");
                expect(patient.forename).toEqual("Neuer Vorname");
                expect(patient.lastname).toEqual("Neuer Nachname");
                expect(patient.info).toEqual("Test info");
            }
        }, timeout);

        // SGBPC25
        it("try to update patient without authentication", async () => {
            const res = await request(app).put(endpoint + "/" + validPatient.id)
                .send(
                    {
                        _email: "new.patient@mail.com",
                        _forename: "Neuer Vorname",
                        _lastname: "Neuer Nachname",
                        _info: "Test info"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPC26
        it("try to update patient with an expired token", async () => {
            const res = await request(app).put(endpoint + "/" + validPatient.id)
                .send(
                    {
                        _email: "new.patient@mail.com",
                        _forename: "Neuer Vorname",
                        _lastname: "Neuer Nachname",
                        _info: "Test info"
                    }
                )
                .set("Authorization", "Bearer " + expiredToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPC27
        it("try to update patient without an id", async () => {
            authenticationToken = await authenticate(validPatient);

            const res = await request(app).put(endpoint + "/")
                .send(
                    {
                        _email: "new.patient@mail.com",
                        _forename: "Neuer Vorname",
                        _lastname: "Neuer Nachname",
                        _info: "Test info"
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("error");
        }, timeout);

        // SGBPC28
        it("try to update patient without an email", async () => {
            authenticationToken = await authenticate(validPatient);

            const res = await request(app).put(endpoint + "/" + validPatient.id)
                .send(
                    {
                        _forename: "Neuer Vorname",
                        _lastname: "Neuer Nachname",
                        _info: "Test info"
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPC29
        it("try to update patient without an forename", async () => {
            authenticationToken = await authenticate(validPatient);

            const res = await request(app).put(endpoint + "/" + validPatient.id)
                .send(
                    {
                        _email: "new.patient@mail.com",
                        _lastname: "Neuer Nachname",
                        _info: "Test info"
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPC30
        it("try to update patient without an lastname", async () => {
            authenticationToken = await authenticate(validPatient);

            const res = await request(app).put(endpoint + "/" + validPatient.id)
                .send(
                    {
                        _email: "new.patient@mail.com",
                        _forename: "Neuer Vorname",
                        _info: "Test info"
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPC31
        it("try to update patient with an invalid email", async () => {
            authenticationToken = await authenticate(validPatient);

            const res = await request(app).put(endpoint + "/" + validPatient.id)
                .send(
                    {
                        _email: "invalid",
                        _forename: "Neuer Vorname",
                        _lastname: "Neuer Nachname",
                        _info: "Test info"
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPC32
        it("try to update patient with an already existing email", async () => {
            authenticationToken = await authenticate(validPatient);

            const res = await request(app).put(endpoint + "/" + validPatient.id)
                .send(
                    {
                        _email: "patient.name@example.org",
                        _forename: "Neuer Vorname",
                        _lastname: "Neuer Nachname",
                        _info: "Test info"
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPC33
        it("try to update patient with a not existing id", async () => {
            authenticationToken = await authenticate(validPatient);

            const res = await request(app).put(endpoint + "/" + 9999)
                .send(
                    {
                        _email: "new.patient@mail.com",
                        _forename: "Neuer Vorname",
                        _lastname: "Neuer Nachname",
                        _info: "Test info"
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

    });

});
