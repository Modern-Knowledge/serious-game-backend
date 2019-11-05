import request from "supertest";
import app from "../../src/app";
import { seedLogs, seedUsers, truncateTables } from "../../src/migrationHelper";
import { authenticate, containsMessage } from "../../src/util/testhelper";
import { validAdminTherapist, validTherapist } from "../../src/seeds/users";
import { HttpResponseMessageSeverity } from "../../src/lib/utils/http/HttpResponse";
import { LogFacade } from "../../src/db/entity/log/LogFacade";

describe("LoggingController Tests", () => {
    describe("GET /logging", () => {
        const endpoint = "/logging";
        const timeout = 10000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
            await seedLogs();
        }, timeout);

        // SGBLOC01
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

        // SGBLOC02
        it("try to fetch all logs with no authentication", async () => {
            const res = await request(app).get(endpoint)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBLOC03
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

        // SGBLOC04
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

        // SGBLOC05
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

        // SGBLOC06
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

        // SGBLOC07
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

        // SGBLOC08
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

    describe("POST /logging", () => {
        const endpoint = "/logging";
        const timeout = 20000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
        }, timeout);

        // SGBLOC09
        it("insert a new log", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const logs = [
                {
                    logger: "logger",
                    level: "debug",
                    message: ["method", "message", "param1 param2"]
                }
            ];

            const res = await request(app).post(endpoint)
                .send(logs)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(201);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("insertedLogs");
            expect(res.body._data.insertedLogs).toEqual(1);
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();


            // check if log was inserted
            const logFacade = new LogFacade();
            const log = await logFacade.getOne();
            if (log) {
                expect(log.logger).toEqual("logger");
                expect(log.level).toEqual("debug");
                expect(log.method).toEqual("method");
                expect(log.message).toEqual("message");
                expect(log.params).toEqual(["param1", "param2"]);
            }

        }, timeout);

        // SGBLOC10
        it("try to insert a new log without a logger", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const logs = [
                {
                    level: "debug",
                    message: ["method", "message", "param1 param2"]
                }
            ];

            const res = await request(app).post(endpoint)
                .send(logs)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(201);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("insertedLogs");
            expect(res.body._data.insertedLogs).toEqual(0);
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

        }, timeout);

        // SGBLOC11
        it("try to insert a new log without a level", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const logs = [
                {
                    logger: "logger",
                    level: "debug"
                }
            ];

            const res = await request(app).post(endpoint)
                .send(logs)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(201);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("insertedLogs");
            expect(res.body._data.insertedLogs).toEqual(0);
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

        }, timeout);

        // SGBLOC12
        it("try to insert a new log without a message", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const logs = [
                {
                    logger: "logger",
                    message: ["method", "message", "param1 param2"]
                }
            ];

            const res = await request(app).post(endpoint)
                .send(logs)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(201);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("insertedLogs");
            expect(res.body._data.insertedLogs).toEqual(0);
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

        }, timeout);

        // SGBLOC13
        it("try to insert a new log with a too short message", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const logs = [
                {
                    logger: "logger",
                    level: "debug",
                    message: ["method"]
                }
            ];

            const res = await request(app).post(endpoint)
                .send(logs)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(201);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("insertedLogs");
            expect(res.body._data.insertedLogs).toEqual(0);
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

        }, timeout);
    });

    describe("DELETE /logging", () => {
        const endpoint = "/logging";
        const timeout = 10000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
            await seedLogs();
        }, timeout);

        // SGBLOC14
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

        // SGBLOC15
        it("try to delete all logs older than 3 months without authentication", async () => {

            const res = await request(app).delete(endpoint)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBLOC16
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

        // SGBLOC17
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