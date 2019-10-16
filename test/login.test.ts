import request from "supertest";
import app from "../src/app";
import { dropTables, runMigrations, seedTables, truncateTables } from "../src/migrationHelper";
import { containsMessage } from "../src/util/testhelper";
import { HttpResponseMessageSeverity } from "../src/lib/utils/http/HttpResponse";
import {
    lockedTherapist,
    tooManyFailedLoginAttemptsTherapist,
    unacceptedTherapist,
    validPatient,
    validTherapist
} from "../src/seeds/users";
import { UserFacade } from "../src/db/entity/user/UserFacade";

const timeout = 100000;

/**
 * Tests for the login-controller
 */
describe("POST /login", () => {
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

    it("login with correct therapist credentials", async () => {
        const res = await request(app).post("/login")
            .send({email: validTherapist.email, password: "123456"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        expect(res.body._status).toEqual("success");
        expect(res.body._data).toHaveProperty("token");
        expect(res.body._data).toHaveProperty("user");
        expect(res.body._data.user._email).toEqual(validTherapist.email);
        containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1);

        const userFacade = new UserFacade();
        const user = await userFacade.getById(validTherapist.id);
        if (user) {
            expect(user.failedLoginAttempts).toEqual(0);
            expect(user.loginCoolDown).toBeUndefined();
            expect(user.lastLogin).not.toBeUndefined();
        }
    }, timeout);

    it("login with correct therapist credentials, but therapist was not accepted", async () => {
        const res = await request(app).post("/login")
            .send({email: unacceptedTherapist.email, password: "123456"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        expect(res.body._status).toEqual("fail");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.WARNING, 1);
    }, timeout);

    it("login with correct patient credentials", async () => {
        const res = await request(app).post("/login")
            .send({email: validPatient.email, password: "123456"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        expect(res.body._status).toEqual("success");
        expect(res.body._data).toHaveProperty("token");
        expect(res.body._data).toHaveProperty("user");
        expect(res.body._data.user._email).toEqual(validPatient.email);
        containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1);

    }, timeout);

    it("try to login with no password passed", async () => {
        const res = await request(app).post("/login")
            .send({email: validPatient.email})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        expect(res.body._status).toEqual("fail");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1);
    }, timeout);

    it("try to login with no email passed", async () => {
        const res = await request(app).post("/login")
            .send({password: "123456"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        expect(res.body._status).toEqual("fail");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1);
    }, timeout);

    it("try to login with invalid email passed", async () => {
        const res = await request(app).post("/login")
            .send({email: "invalidEmail", password: "123456"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        expect(res.body._status).toEqual("fail");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1);
    }, timeout);

    it("try to login with too short password", async () => {
        const res = await request(app).post("/login")
            .send({email: validPatient.email, password: "12345"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        expect(res.body._status).toEqual("fail");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1);
    }, timeout);

    it("try to login with not existing user", async () => {
        const res = await request(app).post("/login")
            .send({email: "notExistingEmail@mail.com", password: "123456"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(404);

        expect(res.body._status).toEqual("fail");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1);
    }, timeout);

    it("try to login with wrong credentials", async () => {
        const res = await request(app).post("/login")
            .send({email: validPatient.email, password: "1234562"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);

        expect(res.body._status).toEqual("fail");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1);

        const userFacade = new UserFacade();
        const user = await userFacade.getById(validPatient.id);
        if (user) {
            expect(user.failedLoginAttempts).toEqual(validPatient.failedLoginAttempts + 1); // failed login attempts
        }
    }, timeout);

    it("try to login with user that has still active login cooldown", async () => {
        const res = await request(app).post("/login")
            .send({email: lockedTherapist.email, password: "123456"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        expect(res.body._status).toEqual("fail");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1);
    }, timeout);

    it("try to login with user that has too many failed login attempts and gets locked", async () => {
        const res = await request(app).post("/login")
            .send({email: tooManyFailedLoginAttemptsTherapist.email, password: "1234562"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);

        expect(res.body._status).toEqual("fail");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1);

        const userFacade = new UserFacade();
        const user = await userFacade.getById(tooManyFailedLoginAttemptsTherapist.id);
        if (user) {
            expect(user.failedLoginAttempts).toEqual(tooManyFailedLoginAttemptsTherapist.failedLoginAttempts + 1); // failed login attempts
            expect(user.loginCoolDown).not.toBeUndefined();
        }
    }, timeout);

});