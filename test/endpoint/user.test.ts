import request from "supertest";
import app from "../../src/app";
import { seedUsers, truncateTables } from "../../src/migrationHelper";
import { authenticate, containsMessage } from "../../src/util/testhelper";
import { validAdminTherapist, validTherapist } from "../../src/seeds/users";
import { HttpResponseMessageSeverity } from "../../src/lib/utils/http/HttpResponse";
import { UserFacade } from "../../src/db/entity/user/UserFacade";
import * as bcrypt from "bcryptjs";
import { SmtpLogFacade } from "../../src/db/entity/log/SmtpLogFacade";

describe("UserController Tests", () => {

    describe("GET /users/related", () => {
        const endpoint = "/users/related";
        const timeout = 10000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
        }, timeout);

        it("retrieve the user for the jwt", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("user");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();
            expect(res.body._data.user._id).toEqual(validTherapist.id);

        }, timeout);

        it("trying to receive the user with jwt without authentication", async () => {
            const res = await request(app).get(endpoint)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).get(endpoint)
                .set("Authorization", "")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to fetch user with jwt with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);
    });

    describe("PUT /users/change-password/:id", () => {
        const endpoint = "/users/change-password";
        const timeout = 30000;
        let authenticationToken: string;

        beforeEach(async () => {
            return truncateTables();
        });

        beforeEach(async () => {
            return seedUsers();
        });

        it("change password of user", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send({
                    oldPassword: "123456",
                    newPassword: "1234567",
                    newPasswordConfirmation: "1234567"
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            const userFacade = new UserFacade();
            const user = await userFacade.getById(validTherapist.id);

            // compare passwords
            const validPassword = bcrypt.compareSync("1234567", user.password);
            expect(validPassword).toEqual(true);

            const smtpLogsFacade = new SmtpLogFacade();
            smtpLogsFacade.filter.addFilterCondition("rcpt_email", validTherapist.email);

            const smtpLog = await smtpLogsFacade.getOne();
            expect(smtpLog).not.toBeUndefined();

            expect(smtpLog.subject).toContain("Ihr Passwort wurde zurückgesetzt!");
        }, timeout);

        it("try to change password without authentication", async () => {
            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send({
                    oldPassword: "123456",
                    newPassword: "1234567",
                    newPasswordConfirmation: "1234567"
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to change password with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send({
                    oldPassword: "123456",
                    newPassword: "1234567",
                    newPasswordConfirmation: "1234567"
                })
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to change password for another user", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validAdminTherapist.id)
                .send({
                    oldPassword: "123456",
                    newPassword: "1234567",
                    newPasswordConfirmation: "1234567"
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to change password without an id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/")
                .send({
                    oldPassword: "123456",
                    newPassword: "1234567",
                    newPasswordConfirmation: "1234567"
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("error");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to change password without an old password", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send({
                    newPassword: "1234567",
                    newPasswordConfirmation: "1234567"
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to change password without a new password", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send({
                    oldPassword: "123456",
                    newPasswordConfirmation: "123456"
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to change password without a password confirmation", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send({
                    oldPassword: "123456",
                    newPassword: "1234567"
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to change password with an invalid new password", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send({
                    oldPassword: "123456",
                    newPassword: "12345",
                    newPasswordConfirmation: "123456"
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to change password with an invalid password confirmation", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send({
                    oldPassword: "123456",
                    newPassword: "123456",
                    newPasswordConfirmation: "12345"
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to change password with an invalid id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/invalid")
                .send({
                    oldPassword: "123456",
                    newPassword: "1234567",
                    newPasswordConfirmation: "1234567"
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to change password but password and password-confirmation do not match", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send({
                    oldPassword: "123456",
                    newPassword: "1234567",
                    newPasswordConfirmation: "12345678"
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to change password with an unknown id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + 9999)
                .send({
                    oldPassword: "123456",
                    newPassword: "1234567",
                    newPasswordConfirmation: "1234567"
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to change the password, but the old password does not match", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + validTherapist.id)
                .send({
                    oldPassword: "1234567",
                    newPassword: "12345678",
                    newPasswordConfirmation: "12345678"
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

    });
});