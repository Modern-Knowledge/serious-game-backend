import request from "supertest";
import app from "../src/app";
import { dropTables, runMigrations, seedTables, truncateTables } from "../src/migrationHelper";
import { containsMessage } from "../src/util/testhelper";
import { HttpResponseMessageSeverity } from "../src/lib/utils/http/HttpResponse";
import { TherapistFacade } from "../src/db/entity/user/TherapistFacade";
import * as bcrypt from "bcryptjs";
import { Status } from "../src/lib/enums/Status";
import { validTherapist } from "../src/seeds/users";

describe("POST /therapists", () => {
    const timeout = 100000;
    const endpoint = "/therapists";

    // drop tables
    beforeAll(async () => {
        return dropTables();
    });

    // run migrations
    beforeAll(async () => {
        return runMigrations();
    });

    // truncate tables
    beforeEach(async () => {
        return truncateTables();
    });

    // seed tables
    beforeEach(async () => {
        return seedTables();
    });

    // SGB013
    it("register new therapist with correct data", async () => {
        const res = await request(app).post("/therapists")
            .send(
                {
                        _email: "newTherapist@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
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
    it("try to register with invalid email", async () => {
        const res = await request(app).post("/therapists")
            .send(
                {
                    _email: "invalidEmail",
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

    // SGB015
    it("try to register with already existing email", async () => {
        const res = await request(app).post("/therapists")
            .send(
                {
                    _email: validTherapist.email,
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

    // SGB016
    it("try to register where password and password_confirmation do not match", async () => {
        const res = await request(app).post("/therapists")
            .send(
                {
                    _email: "newTherapist@mail.com",
                    _forename: "Vorname",
                    _lastname: "Nachname",
                    _password: "123456",
                    password_confirmation: "1234567",
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
    // todo danger messages are returne twice
    it("try to register with password that is too short", async () => {
        const res = await request(app).post("/therapists")
            .send(
                {
                    _email: "newTherapist@mail.com",
                    _forename: "Vorname",
                    _lastname: "Nachname",
                    _password: "12345",
                    password_confirmation: "12345",
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
    it("try to register a new therapist flag set to false", async () => {
        const res = await request(app).post("/therapists")
            .send(
                {
                    _email: "newTherapist@mail.com",
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

    // SGB019
    it("try to register a new therapist without the therapist flag", async () => {
        const res = await request(app).post("/therapists")
            .send(
                {
                    _email: "newTherapist@mail.com",
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

        const res1 = await request(app).post("/therapists")
            .send(
                {
                    _email: "newTherapist@mail.com",
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

    // SGB020
    it("try to register a new therapist without an email", async () => {
        const res = await request(app).post("/therapists")
            .send(
                {
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

        const res1 = await request(app).post("/therapists")
            .send(
                {
                    _email: "",
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

        expect(res1.body._status).toEqual("fail");
        expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

    }, timeout);

    // SGB021
    it("try to register a new therapist without a forename", async () => {
        const res = await request(app).post("/therapists")
            .send(
                {
                    _email: "newTherapist@mail.com",
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

        const res1 = await request(app).post("/therapists")
            .send(
                {
                    _email: "newTherapist@mail.com",
                    _forename: "",
                    _lastname: "Nachname",
                    _password: "123456",
                    password_confirmation: "123456",
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
        const res = await request(app).post("/therapists")
            .send(
                {
                    _email: "newTherapist@mail.com",
                    _forename: "Vorname",
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

        const res1 = await request(app).post("/therapists")
            .send(
                {
                    _email: "newTherapist@mail.com",
                    _forename: "Vorname",
                    _lastname: "",
                    _password: "123456",
                    password_confirmation: "123456",
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
    // todo two messages
    it("try to register a new therapist without a password", async () => {
        const res = await request(app).post("/therapists")
            .send(
                {
                    _email: "newTherapist@mail.com",
                    _forename: "Vorname",
                    _lastname: "Nachname",
                    password_confirmation: "123456",
                    therapist: "true"
                }
            )
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        expect(res.body._status).toEqual("fail");
        expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 2)).toBeTruthy();

        const res1 = await request(app).post("/therapists")
            .send(
                {
                    _email: "newTherapist@mail.com",
                    _forename: "Vorname",
                    _lastname: "Nachname",
                    _password: "",
                    password_confirmation: "123456",
                    therapist: "true"
                }
            )
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        expect(res1.body._status).toEqual("fail");
        expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 2)).toBeTruthy();

    }, timeout);

    // SGB024
    // todo two messages
    it("try to register a new therapist without a password_confirmation", async () => {
        const res = await request(app).post("/therapists")
            .send(
                {
                    _email: "newTherapist@mail.com",
                    _forename: "Vorname",
                    _lastname: "Nachname",
                    _password: "123456",
                    therapist: "true"
                }
            )
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        expect(res.body._status).toEqual("fail");
        expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 2)).toBeTruthy();

        const res1 = await request(app).post("/therapists")
            .send(
                {
                    _email: "newTherapist@mail.com",
                    _forename: "Vorname",
                    _lastname: "Nachname",
                    _password: "123456",
                    password_confirmation: "",
                    therapist: "true"
                }
            )
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        expect(res1.body._status).toEqual("fail");
        expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 2)).toBeTruthy();

    }, timeout);

    // SGB024
    it("try to register a new therapist without any data", async () => {
        const res = await request(app).post("/therapists")
            .send()
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        console.log(res.body._messages.length);

        expect(res.body._status).toEqual("fail");
        expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 7)).toBeTruthy();

        const res1 = await request(app).post("/therapists")
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