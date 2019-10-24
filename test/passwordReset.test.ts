import request from "supertest";
import app from "../src/app";
import { dropTables, runMigrations, seedTables, truncateTables } from "../src/migrationHelper";
import { containsMessage } from "../src/util/testhelper";
import { HttpResponseMessageSeverity } from "../src/lib/utils/http/HttpResponse";
import { validPatient, validTherapist } from "../src/seeds/users";
import { UserFacade } from "../src/db/entity/user/UserFacade";
import { SmtpLogFacade } from "../src/db/entity/log/SmtpLogFacade";
import { SQLComparisonOperator } from "../src/db/sql/enums/SQLComparisonOperator";
import { SQLOperator } from "../src/db/sql/enums/SQLOperator";

describe("PasswordResetController Tests", () => {

    describe("POST /password/reset", () => {
        const timeout = 100000;
        const endpoint = "/password/reset";

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

        // SGB039
        it("request password reset token with valid parameters", async () => {
            const res = await request(app).post(endpoint)
                .send({email: validTherapist.email})
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

        // SGB040
        it("request password reset token with invalid email", async () => {
            const res = await request(app).post(endpoint)
                .send({email: "invalidEmail"})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGB041
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

        // SGB042
        it("request password reset token with email that does not exist", async () => {
            const res = await request(app).post(endpoint)
                .send({email: "notExistingMail@mail.com"})
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGB043
        // todo reset code valid until not matching
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

            // check that mail that should have been sent
            const mail = await smtpLogFacade.getOne();
            expect(mail).not.toBeUndefined();

        }, timeout);
    });
});