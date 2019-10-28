import request from "supertest";
import app from "../src/app";
import { dropTables, runMigrations, seedLogs, seedUsers, truncateTables } from "../src/migrationHelper";
import { authenticate, containsMessage } from "../src/util/testhelper";
import { validAdminTherapist, validTherapist } from "../src/seeds/users";
import { HttpResponseMessageSeverity } from "../src/lib/utils/http/HttpResponse";

describe("LoggingController Tests", () => {
    describe("GET /logging", () => {
        const endpoint = "/logging";
        const timeout = 10000;
        let authenticationToken: string;

        beforeAll(async () => {
            await dropTables();
            await runMigrations();
            await truncateTables();
            await seedUsers();
            await seedLogs();
        }, timeout);

        it("fetch all logs", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("logs");

        }, timeout);

        it("try to fetch all logs with no authentication", async () => {
            const res = await request(app).get(endpoint)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to fetch all logs with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to fetch all logs with no therapist admin", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to fetch all logs with debug level", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).get(endpoint)
                .send({level: "debug"})
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("logs");

            for (const item of res.body._data.logs) {
                expect(item._level).toEqual("debug");
            }

        }, timeout);

        it("try to fetch all logs with a specific method", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).get(endpoint)
                .send({method: "method"})
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("logs");

            for (const item of res.body._data.logs) {
                expect(item._method).toEqual("method");
            }

        }, timeout);

        it("try to fetch all logs with a user id", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).get(endpoint)
                .send({userId: validTherapist.id})
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("logs");

            for (const item of res.body._data.logs) {
                expect(item._userId).toEqual(validTherapist.id);
            }

        }, timeout);

        it("try to fetch all logs with a user id, method and level", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).get(endpoint)
                .send(
                    {
                        userId: validTherapist.id,
                        method: "method",
                        level: "info"
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("logs");

            for (const item of res.body._data.logs) {
                expect(item._userId).toEqual(validTherapist.id);
                expect(item._method).toEqual("method");
                expect(item._level).toEqual("info");

            }

        }, timeout);

    });

    describe("DELETE /logging", () => {
        const endpoint = "/logging";
        const timeout = 10000;
        let authenticationToken: string;

        beforeAll(async () => {
            await dropTables();
            await runMigrations();
            await truncateTables();
            await seedUsers();
            await seedLogs();
        }, timeout);

        it("deletes all logs older than 3 months", async () => {
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

        it("try to delete all logs older than 3 months without authentication", async () => {

            const res = await request(app).delete(endpoint)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to delete all logs older than 3 months with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).delete(endpoint)
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("deletes all logs older than 3 months without an admin therapist", async () => {
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