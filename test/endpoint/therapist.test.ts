import * as bcrypt from "bcryptjs";
import { Roles } from "serious-game-library/dist/enums/Roles";
import { Status } from "serious-game-library/dist/enums/Status";
import { HttpResponseMessageSeverity } from "serious-game-library/dist/utils/http/HttpResponse";
import request from "supertest";
import app from "../../src/app";
import { TherapistFacade } from "../../src/db/entity/user/TherapistFacade";
import { seedUsers, truncateTables } from "../../src/migrationHelper";
import {
    unacceptedTherapist,
    validAdminTherapist,
    validPatient,
    validPatient1,
    validTherapist
} from "../../src/seeds/users";
import { authenticate, containsMessage } from "../../src/util/testhelper";

describe("TherapistController Tests", () => {

    describe("GET /therapists", () => {
        const endpoint = "/therapists";
        const timeout = 10000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
        }, timeout);

        // SGBTC01
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

        // SGBTC02
        it("try to fetch all therapists without authentication", async () => {
            const res = await request(app).get(endpoint)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBTC03
        it("try to fetch all therapists with expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwi" +
                "ZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWx" +
                "zZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qv" +
                "VSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBTC04
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

        // SGBTC05
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

        // SGBTC06
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

        // SGBTC07
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

        // SGBTC08
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

        // SGBTC09
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

        // SGBTC10
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

        // SGBTC11
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

        // SGBTC12
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

        // SGBTC13
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

        // SGBTC14
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

        // SGBTC15
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

        // SGBTC16
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

        // SGBTC17
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

        // SGBTC18
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

        // SGBTC19
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

        // SGBTC20
        it("try to update therapist with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwi" +
                "ZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWx" +
                "zZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qv" +
                "VSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

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

        // SGBTC21
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

        // SGBTC22
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
        }, timeout);

        // SGBTC23
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

        // SGBTC24
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

        // SGBTC25
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

        // SGBTC26
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

        // SGBTC27
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

        // SGBTC28
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

        // SGBTC29
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

        // SGBTC30
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

        // SGBTC31
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

        // SGBTC32
        it("try to delete therapist with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwi" +
                "ZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWx" +
                "zZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qv" +
                "VSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).delete(endpoint + "/" + unacceptedTherapist.id)
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBTC33
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

        // SGBTC34
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

        // SGBTC35
        it("try to delete therapist without an id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).delete(endpoint + "/")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("error");
        }, timeout);

        // SGBTC36
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

        // SGBTC37
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

        // SGBTC38
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

        // SGBTC39
        it("try to accept therapist without being authenticated as admin", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + unacceptedTherapist.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBTC40
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

        // SGBTC41
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

        // SGBTC42
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

        // SGBTC43
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

        // SGBTC44
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
