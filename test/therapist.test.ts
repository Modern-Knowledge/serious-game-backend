import request from "supertest";
import app from "../src/app";
import { seedUsers, truncateTables } from "../src/migrationHelper";
import { authenticate, containsMessage } from "../src/util/testhelper";
import { HttpResponseMessageSeverity } from "../src/lib/utils/http/HttpResponse";
import { TherapistFacade } from "../src/db/entity/user/TherapistFacade";
import * as bcrypt from "bcryptjs";
import { Status } from "../src/lib/enums/Status";
import {
    unacceptedTherapist,
    validAdminTherapist,
    validPatient,
    validPatient1,
    validTherapist
} from "../src/seeds/users";
import { Roles } from "../src/lib/enums/Roles";

describe("TherapistController Tests", () => {

    describe("GET /therapists", () => {
        const endpoint = "/therapists";
        const timeout = 10000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
        }, timeout);

        it("fetch all therapists", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("therapists");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();
        }, timeout);

        it("try to fetch all therapists without authentication", async () => {
            const res = await request(app).get(endpoint)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to fetch all therapists with expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to fetch all therapists with patient user", async () => {
            authenticationToken = await authenticate(validPatient);

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

    });

    describe("POST /therapists", () => {
        const timeout = 100000;
        const endpoint = "/therapists";

        beforeEach(async () => {
            await truncateTables();
            await seedUsers();
        }, timeout);

        // SGB013
        it("register new therapist with correct data", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newTherapist@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        _role: Roles.USER,
                        therapist: "true"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(201);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("user");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            const therapistId = res.body._data.user._id;

            const therapistFacade = new TherapistFacade();
            const therapist = await therapistFacade.getById(therapistId);

            expect(therapist).not.toBeUndefined();

            if (therapist) {
                expect(therapist.failedLoginAttempts).toEqual(0);
                expect(therapist.accepted).toBeFalsy();
                expect(therapist.status).toEqual(Status.ACTIVE);

                const compPasswords = bcrypt.compareSync("123456", therapist.password);
                expect(compPasswords).toBeTruthy();
            }
        }, timeout);

        // SGB014
        it("try to register therapist with invalid email", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "invalidEmail",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        _role: Roles.USER,
                        therapist: "true"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGB015
        it("try to register therapist with already existing email", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: validTherapist.email,
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        _role: Roles.USER,
                        therapist: "true"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGB016
        it("try to register therapist where password and password_confirmation do not match", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newTherapist@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "1234567",
                        _role: Roles.USER,
                        therapist: "true"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGB017
        it("try to register therapist with password that is too short", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newTherapist@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "12345",
                        password_confirmation: "12345",
                        _role: Roles.USER,
                        therapist: "true"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 2)).toBeTruthy();
        }, timeout);

        // SGB018
        it("try to register therapist where therapist flag set to false", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newTherapist@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        _role: Roles.USER,
                        therapist: "false"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGB019
        it("try to register a new therapist without the therapist flag", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newTherapist@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        _role: Roles.USER,
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
                        password_confirmation: "123456",
                        _role: Roles.USER,
                        therapist: ""
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGB020
        it("try to register a new therapist without an email", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        _role: Roles.USER,
                        therapist: "true"
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
                        _role: Roles.USER,
                        therapist: "true"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGB021
        it("try to register a new therapist without a forename", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newTherapist@mail.com",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        _role: Roles.USER,
                        therapist: "true"
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
                        _role: Roles.USER,
                        therapist: "true"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGB022
        it("try to register a new therapist without a lastname", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newTherapist@mail.com",
                        _forename: "Vorname",
                        _password: "123456",
                        password_confirmation: "123456",
                        _role: Roles.USER,
                        therapist: "true"
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
                        _role: Roles.USER,
                        therapist: "true"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGB023
        it("try to register a new therapist without a password", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newTherapist@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        password_confirmation: "123456",
                        _role: Roles.USER,
                        therapist: "true"
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
                        _password: "",
                        password_confirmation: "123456",
                        _role: Roles.USER,
                        therapist: "true"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGB024
        it("try to register a new therapist without a password_confirmation", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _email: "newTherapist@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        _role: Roles.USER,
                        therapist: "true"
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
                        _role: Roles.USER,
                        therapist: "true"
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGB024
        it("try to register a new therapist without any data", async () => {
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
                        _role: Roles.USER,
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

    describe("PUT /therapists/:id", () => {
        const timeout = 100000;
        const endpoint = "/therapists";
        let authenticationToken;

        beforeEach(async () => {
            await truncateTables();
            await seedUsers();
        }, timeout);

        it("successfully update therapist", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send(
                    {
                        _email: "newtherapist@mail.com",
                        _forename: "Neuer Vorname",
                        _lastname: "Neuer Nachname",
                        _patients: [
                            validPatient,
                            validPatient1
                        ]
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("therapist");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            const therapistId = res.body._data.therapist._id;

            const therapistFacade = new TherapistFacade();
            const therapist = await therapistFacade.getById(therapistId);

            expect(therapist).not.toBeUndefined();

            if (therapist) {
                expect(therapist.email).toEqual("newtherapist@mail.com");
                expect(therapist.forename).toEqual("Neuer Vorname");
                expect(therapist.lastname).toEqual("Neuer Nachname");
            }
        }, timeout);

        it("try to update therapist without authentication", async () => {
            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send(
                    {
                        _email: "newtherapist@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _patients: [
                            validPatient,
                            validPatient1
                        ]
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to update therapist with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send(
                    {
                        _email: "newtherapist@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _patients: [
                            validPatient,
                            validPatient1
                        ]
                    }
                )
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to update another therapist", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validAdminTherapist.id)
                .send(
                    {
                        _email: "newtherapist@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _patients: [
                            validPatient,
                            validPatient1
                        ]
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to update therapist without an id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/")
                .send(
                    {
                        _email: "mail@example.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _patients: [
                            validPatient,
                            validPatient1
                        ]
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("error");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to update therapist without an email", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send(
                    {
                        _forename: "Vorname",
                        _lastname: "Nachname",
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to update therapist without an forename", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send(
                    {
                        _email: "mail@example.com",
                        _lastname: "Nachname",
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to update therapist without an lastname", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send(
                    {
                        _email: "mail@example.com",
                        _forename: "Vorname",
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to update therapist with an invalid email", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send(
                    {
                        _email: "invalid",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _patients: [
                            validPatient,
                            validPatient1
                        ]
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to update therapist with a not existing id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + 9999)
                .send(
                    {
                        _email: "mail@example.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _patients: [
                            validPatient,
                            validPatient1
                        ]
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to update therapist with a existing email", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send(
                    {
                        _email: "therapist@example.org",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _patients: [
                            validPatient,
                            validPatient1
                        ]
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to update therapist with an invalid patient list", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send(
                    {
                        _email: "mail@example.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _patients: [
                            "validPatient",
                        ]
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

    });

    describe("DELETE /therapists/:id", () => {
        const endpoint = "/therapists";
        const timeout = 10000;
        let authenticationToken: string;

        beforeEach(async () => {
            return truncateTables();
        });

        beforeEach(async () => {
            return seedUsers();
        });

        it("successfully delete therapist", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).delete(endpoint + "/" + validTherapist.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(201);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            // check if therapist was deleted
            const therapistFacade = new TherapistFacade();
            const therapist = await therapistFacade.getById(validTherapist.id);
            expect(therapist).toBeUndefined();

        }, timeout);

        it("try to delete therapist without authentication", async () => {
            const res = await request(app).delete(endpoint + "/" + validTherapist.id)
                .set("Authorization", "")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).delete(endpoint + "/" + validTherapist.id)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to delete therapist with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).delete(endpoint + "/" + unacceptedTherapist.id)
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to delete other therapist", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).delete(endpoint + "/" + unacceptedTherapist.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to delete therapist authenticated as patient", async () => {
            authenticationToken = await authenticate(validPatient);

            const res = await request(app).delete(endpoint + "/" + unacceptedTherapist.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to delete therapist without an id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).delete(endpoint + "/")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("error");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to delete therapist without an invalid id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).delete(endpoint + "/invalid")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);
    });

    describe("PUT /therapists/toggle-accepted/:id", () => {
        const endpoint = "/therapists/toggle-accepted";
        const timeout = 10000;
        let authenticationToken: string;

        beforeEach(async () => {
            return truncateTables();
        });

        beforeEach(async () => {
            return seedUsers();
        });

        it("successfully accept therapist", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).put(endpoint + "/" + unacceptedTherapist.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();
        }, timeout);

        it("successfully unaccept therapist", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();
        }, timeout);

        it("try to accept therapist without being authenticated as admin", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + unacceptedTherapist.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            console.log(res.body);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to accept therapist with invalid id", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).put(endpoint + "/invalid")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to accept therapist without an id", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).put(endpoint + "/")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to accept therapist without authentication", async () => {
            const res = await request(app).put(endpoint + "/" + unacceptedTherapist.id)
                .set("Authorization", "Bearer")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).put(endpoint + "/" + unacceptedTherapist.id)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to accept therapist without an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).put(endpoint + "/" + unacceptedTherapist.id)
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to accept therapist that does not exist", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).put(endpoint + "/" + 9999)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);
    });
});
