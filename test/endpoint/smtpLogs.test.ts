import request from "supertest";
import app from "../../src/app";
import { HttpResponseMessageSeverity } from "../../src/lib/utils/http/HttpResponse";
import { seedSmtpLogs, seedUsers, truncateTables } from "../../src/migrationHelper";
import { validAdminTherapist, validPatient, validTherapist } from "../../src/seeds/users";
import { authenticate, containsMessage } from "../../src/util/testhelper";

describe("SMTPLoggingController Tests", () => {

    describe("GET /smtp-logs", () => {
        const endpoint = "/smtp-logs";
        const timeout = 10000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
            await seedSmtpLogs();
        }, timeout);

        // SBGSLC01
        it("fetch all smtp logs", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("logs");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

        }, timeout);

        // SBGSLC02
        it("fetch all sent smtp logs", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).get(endpoint)
                .send({
                    sent: 1
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("logs");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            // check if all logs are sent
            const logs = res.body._data.logs;

            for (const log of logs) {
                expect(log._sent).toEqual(1);
            }

        }, timeout);

        // SBGSLC03
        it("fetch all simulated smtp logs", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).get(endpoint)
                .send({
                    simulated: 1
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("logs");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            // check if all logs are sent
            const logs = res.body._data.logs;

            for (const log of logs) {
                expect(log._simulated).toEqual(1);
            }

        }, timeout);

        // SBGSLC04
        it("fetch all simulated and sent smtp-logs", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).get(endpoint)
                .send({
                    simulated: 1,
                    sent: 1
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("logs");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            // check if all logs are sent
            const logs = res.body._data.logs;

            for (const log of logs) {
                expect(log._simulated).toEqual(1);
                expect(log._sent).toEqual(1);

            }

        }, timeout);

        // SBGSLC05
        it("try to fetch all smtp logs without authentication", async () => {
            const res = await request(app).get(endpoint)
                .set("Authorization", "")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).get(endpoint)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SBGSLC06
        it("try to fetch all smtp logs with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).get(endpoint)
                .set("Authorization", token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SBGSLC07
        it("try to fetch all smtp logs without an admin therapist", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SBGSLC08
        it("try to fetch all smtp logs with a patient", async () => {
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

    describe("DELETE /smtp-logs", () => {
        const endpoint = "/smtp-logs";
        const timeout = 10000;
        let authenticationToken: string;

        beforeEach(async () => {
            await truncateTables();
            await seedUsers();
            await seedSmtpLogs();
        }, timeout);

        // SBGSLC09
        it("deletes all smtp logs older than 3 months", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).delete(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("affectedRows");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

        }, timeout);

        // SBGSLC10
        it("try to delete all smtp logs older than 3 months without authentication", async () => {
            const res = await request(app).delete(endpoint)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SBGSLC11
        it("try to delete all smtp logs older than 3 months with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).delete(endpoint)
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SBGSLC12
        it("deletes all smtp logs older than 3 months without an admin therapist", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).delete(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);
    });
});
