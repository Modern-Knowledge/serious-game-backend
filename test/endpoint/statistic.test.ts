import request from "supertest";
import app from "../../src/app";
import { seedStatistics, seedUsers, truncateTables } from "../../src/migrationHelper";
import { authenticate, containsMessage } from "../../src/util/testhelper";
import { validTherapist } from "../../src/seeds/users";
import { HttpResponseMessageSeverity } from "../../src/lib/utils/http/HttpResponse";
import { statistic } from "../../src/seeds/statistics";
import moment = require("moment");
import { StatisticFacade } from "../../src/db/entity/game/StatisticFacade";

describe("StatisticController Tests", () => {
    describe("GET /statistics/:id", () => {
        const endpoint = "/statistics";
        const timeout = 10000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
            await seedStatistics();
        }, timeout);

        it("fetch statistic with specific id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/" + statistic.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("statistic");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            expect(res.body._data.statistic._id).toEqual(statistic.id);

        }, timeout);

        it("try to fetch statistic with id without authentication", async () => {
            const res = await request(app).get(endpoint + "/" + statistic.id)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).get(endpoint + "/" + statistic.id)
                .set("Authorization", "")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to fetch statistic with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).get(endpoint + "/" + statistic.id)
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to fetch statistic with an invalid id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/invalid")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to fetch statistic with a not existing id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/" + 9999)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);
    });

    describe("PUT /statistics/:id", () => {
        const endpoint = "/statistics";
        const timeout = 10000;
        let authenticationToken: string;

        beforeEach(async () => {
            await truncateTables();
            await seedUsers();
            await seedStatistics();
        }, timeout);

        it("successfully update statistic", async () => {
            authenticationToken = await authenticate(validTherapist);

            const startTime = new Date();
            const endTime = moment().add(1, "hour").toDate();

            const res = await request(app).put(endpoint + "/" + statistic.id)
                .send({
                    _startTime: startTime,
                    _endTime: endTime
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("statistic");
            expect(res.body._data).toHaveProperty("token");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            // check if statistic was updated
            const statisticFacade = new StatisticFacade();
            const dbStatistic = await statisticFacade.getById(statistic.id);

            expect(dbStatistic).not.toBeUndefined();

        }, timeout);

        it("try to update statistic without authentication", async () => {
            const res = await request(app).put(endpoint + "/" + statistic.id)
                .send({
                    _startTime: new Date(),
                    _endTime: moment().add(1, "hour").toDate()
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to update statistic with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).put(endpoint + "/" + statistic.id)
                .send({
                    _startTime: new Date(),
                    _endTime: moment().add(1, "hour").toDate()
                })
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to update statistic with no id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/")
                .send({
                    _startTime: new Date(),
                    _endTime: moment().add(1, "hour").toDate()
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("error");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to update statistic with no start time", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + statistic.id)
                .send({
                    _endTime: new Date()
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 2)).toBeTruthy();

        }, timeout);

        it("try to update statistic with no end time", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + statistic.id)
                .send({
                    _startTime: new Date(),
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 2)).toBeTruthy();

        }, timeout);

        it("try to update statistic with an invalid id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/invalid")
                .send({
                    _startTime: new Date(),
                    _endTime: moment().add(1, "hour").toDate()
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to update statistic with an invalid start time", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + statistic.id)
                .send({
                    _startTime: "invalid",
                    _endTime: moment().add(1, "hour").toDate()
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 2)).toBeTruthy();

        }, timeout);

        it("try to update statistic with an invalid end time", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + statistic.id)
                .send({
                    _startTime: new Date(),
                    _endTime: "invalid"
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 2)).toBeTruthy();

        }, timeout);

        it("try to update statistic without any data", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + statistic.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 3)).toBeTruthy();

        }, timeout);

        it("try to update statistic but startTime is after endTime", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + statistic.id)
                .send({
                    _startTime: moment().add(2, "hour").toDate(),
                    _endTime: moment().add(1, "hour").toDate()
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to update statistic with a not existing id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).put(endpoint + "/" + 9999)
                .send({
                    _startTime: new Date(),
                    _endTime: moment().add(1, "hour").toDate()
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);
    });

});