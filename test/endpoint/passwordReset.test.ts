import request from "supertest";
import app from "../../src/app";
import { seedUsers, truncateTables } from "../../src/migrationHelper";
import { containsMessage } from "../../src/util/testhelper";
import { HttpResponseMessageSeverity } from "../../src/lib/utils/http/HttpResponse";
import {
    unacceptedTherapist,
    validAdminTherapist,
    validPatient,
    validPatient1,
    validTherapist
} from "../../src/seeds/users";
import { UserFacade } from "../../src/db/entity/user/UserFacade";
import { SmtpLogFacade } from "../../src/db/entity/log/SmtpLogFacade";
import { SQLComparisonOperator } from "../../src/db/sql/enums/SQLComparisonOperator";
import { SQLOperator } from "../../src/db/sql/enums/SQLOperator";
import * as bcrypt from "bcryptjs";

describe("PasswordResetController Tests", () => {

    describe("POST /password/reset", () => {
        const timeout = 100000;
        const endpoint = "/password/reset";

        beforeEach(async () => {
            await truncateTables();
            await seedUsers();
        });

        // SGBPRC01
        it("request password reset token with valid parameters", async () => {
            const res = await request(app).post(endpoint)
                .send({email: validAdminTherapist.email})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("email");
            expect(res.body._data).toHaveProperty("reset_code");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            const userEmail = res.body._data.email;

            const userFacade = new UserFacade();
            userFacade.filter.addFilterCondition("email", userEmail);

            // check if attributes were set in db
            const user = await userFacade.getOne();

            expect(user).not.toBeUndefined();

            if (user) {
                expect(user.resetcode).not.toBeUndefined();
                expect(user.resetcodeValidUntil).not.toBeUndefined();
            }

            const smtpLogFacade = new SmtpLogFacade();
            smtpLogFacade.filter.addFilterCondition("rcpt_email", user.email, SQLComparisonOperator.EQUAL, SQLOperator.AND);
            smtpLogFacade.filter.addFilterCondition("sent", 0);

            // check that mail that should have been sent
            const mail = await smtpLogFacade.getOne();
            expect(mail).not.toBeUndefined();

        }, timeout);

        // SGBPRC02
        it("request password reset token with invalid email", async () => {
            const res = await request(app).post(endpoint)
                .send({email: "invalidEmail"})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBPRC03
        it("request password reset token with no email", async () => {
            const res = await request(app).post(endpoint)
                .send({email: ""})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).post(endpoint)
                .send()
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBPRC04
        it("request password reset token with email that does not exist", async () => {
            const res = await request(app).post(endpoint)
                .send({email: "notExistingMail@mail.com"})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBPRC05
        it("request password reset token with user that has already a valid token", async () => {
            const res = await request(app).post(endpoint)
                .send({email: validPatient.email})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("email");
            expect(res.body._data).toHaveProperty("reset_code");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            const userEmail = res.body._data.email;

            const userFacade = new UserFacade();
            userFacade.filter.addFilterCondition("email", userEmail);

            // check if attributes were set in db
            const user = await userFacade.getOne();

            expect(user).not.toBeUndefined();

            if (user) {
                expect(user.resetcode).toEqual(validPatient.resetcode);
            }

            const smtpLogFacade = new SmtpLogFacade();
            smtpLogFacade.filter.addFilterCondition("rcpt_email", user.email, SQLComparisonOperator.EQUAL, SQLOperator.AND);
            smtpLogFacade.filter.addFilterCondition("sent", 0);

            // check mail that should have been sent
            const mail = await smtpLogFacade.getOne();
            expect(mail).not.toBeUndefined();

        }, timeout);
    });

    describe("POST /password/reset-password", () => {
        const timeout = 100000;
        const endpoint = "/password/reset-password";

        beforeEach(async () => {
            await truncateTables();
            await seedUsers();
        });

        // SGBPRC06
        it("reset password with valid parameters", async () => {
            const res = await request(app).post(endpoint)
                .send({
                    email: validTherapist.email,
                    password: "123456",
                    token: validTherapist.resetcode
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            // check if user was updated
            const userFacade = new UserFacade();
            const user = await userFacade.getById(validTherapist.id);

            expect(user).not.toBeUndefined();

            if (user) {
                const validPassword = bcrypt.compareSync("123456", user.password);
                expect(validPassword).toBeTruthy();
                expect(user.resetcode).toBeUndefined();
                expect(user.resetcodeValidUntil).toBeUndefined();
            }

            const smtpLogFacade = new SmtpLogFacade();
            smtpLogFacade.filter.addFilterCondition("rcpt_email", user.email, SQLComparisonOperator.EQUAL, SQLOperator.AND);
            smtpLogFacade.filter.addFilterCondition("sent", 0);

            // check mail that should have been sent
            const mail = await smtpLogFacade.getOne();
            expect(mail).not.toBeUndefined();

        }, timeout);

        // SGBPRC07
        it("try to reset password without a password", async () => {
            const res = await request(app).post(endpoint)
                .send({
                    email: validTherapist.email,
                    token: validTherapist.resetcode
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPRC08
        it("try to reset password without a email", async () => {
            const res = await request(app).post(endpoint)
                .send({
                    password: "123456",
                    token: validTherapist.resetcode
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPRC09
        it("try to reset password without a token", async () => {
            const res = await request(app).post(endpoint)
                .send({
                    email: validTherapist.email,
                    password: "123456"
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 2)).toBeTruthy();
        }, timeout);

        // SGBPRC10
        it("try to reset password with a too short token", async () => {
            const res = await request(app).post(endpoint)
                .send({
                    email: validTherapist.email,
                    password: "123456",
                    token: 1234
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPRC11
        it("try to reset password with an invalid email", async () => {
            const res = await request(app).post(endpoint)
                .send({
                    email: "invalid",
                    password: "123456",
                    token: validTherapist.resetcode
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPRC12
        it("try to reset password with an invalid token", async () => {
            const res = await request(app).post(endpoint)
                .send({
                    email: validTherapist.email,
                    password: "123456",
                    token: "12345678"
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPRC13
        it("try to reset password with a not existing email", async () => {
            const res = await request(app).post(endpoint)
                .send({
                    email: "not.existing@mail.com",
                    password: "123456",
                    token: validTherapist.resetcode
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPRC14
        it("try to reset password with a user that has not requested a token", async () => {
            const res = await request(app).post(endpoint)
                .send({
                    email: validAdminTherapist.email,
                    password: "123456",
                    token: "12345678"
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPRC15
        it("try to reset password with a user that has no token expire time in the database", async () => {
            const res = await request(app).post(endpoint)
                .send({
                    email: unacceptedTherapist.email,
                    password: "123456",
                    token: unacceptedTherapist.resetcode
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBPRC16
        it("try to reset password with a user that has an expired token", async () => {
            const res = await request(app).post(endpoint)
                .send({
                    email: validPatient1.email,
                    password: "123456",
                    token: validPatient1.resetcode
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);


            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

    });
});