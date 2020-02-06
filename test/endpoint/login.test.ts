
import request from "supertest";
import app from "../../src/app";
import { UserFacade } from "../../src/db/entity/user/UserFacade";
import { HttpResponseMessageSeverity } from "../../src/lib/utils/http/HttpResponse";
import { seedUsers, truncateTables } from "../../src/migrationHelper";
import {
    lockedTherapist,
    tooManyFailedLoginAttemptsTherapist,
    unacceptedTherapist,
    validPatient,
    validTherapist
} from "../../src/seeds/users";
import { containsMessage } from "../../src/util/testhelper";

describe("LoginController Tests", () => {

    describe("POST /login", () => {
        const timeout = 100000;
        const endpoint = "/login";

        beforeEach(async () => {
            return truncateTables();
        });

        beforeEach(async () => {
            return seedUsers();
        });

        // SGBLC01
        it("login with correct therapist credentials", async () => {
            const res = await request(app).post(endpoint)
                .send({email: validTherapist.email, password: "123456"})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("user");
            expect(res.body._data.user._email).toEqual(validTherapist.email);
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            const userFacade = new UserFacade();
            const user = await userFacade.getById(validTherapist.id);
            expect(user).not.toBeUndefined();

            if (user) {
                expect(user.failedLoginAttempts).toEqual(0);
                expect(user.loginCoolDown).toBeUndefined();
                expect(user.lastLogin).not.toBeUndefined();
            }
        }, timeout);

        // SGBLC02
        it("login with correct therapist credentials, but therapist was not accepted", async () => {
            const res = await request(app).post(endpoint)
                .send({email: unacceptedTherapist.email, password: "123456"})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.WARNING, 1)).toBeTruthy();
        }, timeout);

        // SGBLC03
        it("login with correct patient credentials", async () => {
            const res = await request(app).post(endpoint)
                .send({email: validPatient.email, password: "123456"})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("user");
            expect(res.body._data.user._email).toEqual(validPatient.email);
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();
        }, timeout);

        // SGBLC04
        it("try to login with no password passed", async () => {
            const res = await request(app).post(endpoint)
                .send({email: validPatient.email})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBLC05
        it("try to login with no email passed", async () => {
            const res = await request(app).post(endpoint)
                .send({password: "123456"})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).post(endpoint)
                .send({email: "", password: "123456"})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBLC06
        it("try to login with no body passed", async () => {
            const res = await request(app).post(endpoint)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 2)).toBeTruthy();
        }, timeout);

        // SGBLC07
        it("try to login with invalid email passed", async () => {
            const res = await request(app).post(endpoint)
                .send({email: "invalidEmail", password: "123456"})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBLC08
        it("try to login with too short password", async () => {
            const res = await request(app).post(endpoint)
                .send({email: validPatient.email, password: "12345"})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBLC09
        it("try to login with not existing user", async () => {
            const res = await request(app).post(endpoint)
                .send({email: "notExistingEmail@mail.com", password: "123456"})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBLC10
        it("try to login with wrong credentials", async () => {
            const res = await request(app).post(endpoint)
                .send({email: validPatient.email, password: "1234562"})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const userFacade = new UserFacade();
            const user = await userFacade.getById(validPatient.id);
            if (user) {
                expect(user.failedLoginAttempts).toEqual(validPatient.failedLoginAttempts + 1); // failed login attempts
            }
        }, timeout);

        // SGBLC11
        it("try to login with user that has still active login cooldown", async () => {
            const res = await request(app).post(endpoint)
                .send({email: lockedTherapist.email, password: "123456"})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1);
        }, timeout);

        // SGBLC12
        it("try to login with user that has too many failed login attempts and gets locked", async () => {
            const res = await request(app).post(endpoint)
                .send({email: tooManyFailedLoginAttemptsTherapist.email, password: "1234562"})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1);

            const userFacade = new UserFacade();
            const user = await userFacade.getById(tooManyFailedLoginAttemptsTherapist.id);
            if (user) {
                expect(user.failedLoginAttempts)
                    .toEqual(tooManyFailedLoginAttemptsTherapist.failedLoginAttempts + 1);
                expect(user.loginCoolDown).not.toBeUndefined();
            }
        }, timeout);

    });
});
