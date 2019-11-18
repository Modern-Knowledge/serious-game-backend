import request from "supertest";
import app from "../../src/app";
import { ErrortextStatisticFacade } from "../../src/db/entity/helptext/ErrortextStatisticFacade";
import { HttpResponseMessageSeverity } from "../../src/lib/utils/http/HttpResponse";
import {
    seedErrortexts,
    seedSeverities, seedStatistics,
    seedUsers,
    truncateTables
} from "../../src/migrationHelper";
import {mealtimeError, shoppingCartError} from "../../src/seeds/errortexts";
import { statistic } from "../../src/seeds/statistics";
import { validTherapist } from "../../src/seeds/users";
import { authenticate, containsMessage } from "../../src/util/testhelper";

const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwi" +
    "ZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWx" +
    "zZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qv" +
    "VSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

describe("ErrortextController Tests", () => {

    describe("GET /errortexts", () => {
        const endpoint = "/errortexts";
        const timeout = 50000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
            await seedSeverities();
            await seedErrortexts();
        }, timeout);

        // SGBEC01
        it("fetch all errortexts", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("errortexts");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();
        }, timeout);

        // SGBEC02
        it("try to fetch all errortexts without authentication", async () => {
            const res = await request(app).get(endpoint)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBEC03
        it("try to fetch all errortexts with an expired token", async () => {

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + expiredToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);
    });

    describe("GET /errortexts/:id", () => {
        const endpoint = "/errortexts";
        const timeout = 10000;
        let authenticationToken: string;

        // drop tables
        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
            await seedSeverities();
            await seedErrortexts();
        });

        // SGBEC04
        it("fetch errortext with specific id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/" + mealtimeError.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("errortext");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            expect(res.body._data.errortext._id).toEqual(mealtimeError.id);
        }, timeout);

        // SGBEC05
        it("try to fetch errortext with id without authentication", async () => {
            const res = await request(app).get(endpoint + "/" + mealtimeError.id)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBEC06
        it("try to fetch all errortext with an expired token", async () => {
            const res = await request(app).get(endpoint + "/" + mealtimeError.id)
                .set("Authorization", "Bearer " + expiredToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBEC07
        it("try to fetch errortext with an invalid id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/invalid")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBEC08
        it("try to fetch errortext with a not existing id", async () => {
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

    describe("POST /errortexts/", () => {
        const endpoint = "/errortexts/";
        const timeout = 10000;
        let authenticationToken: string;

        beforeEach(async () => {
            await truncateTables();
            await seedUsers();
            await seedSeverities();
            await seedErrortexts();
            await seedStatistics();
        });

        it("create new errortext-statistic!", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send({
                    errortext: {
                        _id: mealtimeError.id
                    },
                    session: {
                        _statisticId: statistic.id
                    }
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("errortext");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            expect(res.body._data.errortext._id).toEqual(mealtimeError.id);
            expect(res.body._data.errortext._statisticId).toEqual(statistic.id);

            const errortextStatisticId = res.body._data.errortext.id;
            // check if errortext-statistic was created
            const errortextStatisticFacade = new ErrortextStatisticFacade();
            const errortextStatistic = await errortextStatisticFacade.getById(errortextStatisticId);

            if (errortextStatistic) {
               expect(errortextStatistic).not.toBeUndefined();
            }

        }, timeout);

        it("try to create new errortext-statistic without authentication", async () => {
            const res = await request(app).post(endpoint)
                .send({
                    errortext: {
                        _id: mealtimeError.id
                    },
                    session: {
                        _statisticId: statistic.id
                    }
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create new error-statistic with an expired token", async () => {
            const res = await request(app).post(endpoint)
                .send({
                    errortext: {
                        _id: mealtimeError.id
                    },
                    session: {
                        _statisticId: statistic.id
                    }
                })
                .set("Authentication", "Bearer " + expiredToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create errortext-statistic without any data", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 2)).toBeTruthy();

        }, timeout);

        it("try to create errortext-statistic without errortext id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send({
                    session: {
                        _statisticId: statistic.id
                    }
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create errortext-statistic without session id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send({
                    errortext: {
                        _id: mealtimeError.id
                    }
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create errortext-statistic with an invalid errortext id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send({
                    errortext: {
                        _id: "invalid"
                    },
                    session: {
                        _statisticId: statistic.id
                    }
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create errortext-statistic with an invalid statistic id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send({
                    errortext: {
                        _id: mealtimeError.id
                    },
                    session: {
                        _statisticId: "invalid"
                    }
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create errortext-statistic with a not known statistic id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send({
                    errortext: {
                        _id: mealtimeError.id
                    },
                    session: {
                        _statisticId: 9999
                    }
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create errortext-statistic with a not known errortext id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send({
                    errortext: {
                        _id: 9999
                    },
                    session: {
                        _statisticId: statistic.id
                    }
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);
    });

    describe("POST /errortexts/bulk", () => {
        const endpoint = "/errortexts/bulk";
        const timeout = 10000;
        let authenticationToken: string;

        beforeEach(async () => {
            await truncateTables();
            await seedUsers();
            await seedSeverities();
            await seedErrortexts();
            await seedStatistics();
        });

        it("create new errortext-statistics!", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send({
                    errortexts: [
                        {
                            _id: mealtimeError.id
                        },
                        {
                            _id: shoppingCartError.id
                        }
                    ],
                    session: {
                        _statisticId: statistic.id
                    }
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("errortexts");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            const errortexts = res.body._data.errortexts;
            const errortextStatisticFacade = new ErrortextStatisticFacade();

            // check if errortext-statistics were created
            for (const errortext of errortexts) {
                const errortextStatistic = await errortextStatisticFacade.getById(errortext._id);

                if (errortextStatistic) {
                    expect(errortextStatistic).not.toBeUndefined();
                }
            }

        }, timeout);

        it("try to create errortext-statistics without authentication", async () => {
            const res = await request(app).post(endpoint)
                .send({
                    errortexts: [
                        {
                            _id: mealtimeError.id
                        },
                        {
                            _id: shoppingCartError.id
                        }
                    ],
                    session: {
                        _statisticId: statistic.id
                    }
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create errortext-statistics with an expired token", async () => {
            const res = await request(app).post(endpoint)
                .send({
                    errortexts: [
                        {
                            _id: mealtimeError.id
                        },
                        {
                            _id: shoppingCartError.id
                        }
                    ],
                    session: {
                        _statisticId: statistic.id
                    }
                })
                .set("Authentication", "Bearer " + expiredToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create errortext-statistics without any data", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create errortext-statistics without statistic id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send({
                    errortexts: [
                        {
                            _id: mealtimeError.id
                        },
                        {
                            _id: shoppingCartError.id
                        }
                    ],
                    session: {}
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create errortext-statistics without errortexts", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send({
                    session: {
                        _statisticId: statistic.id
                    }
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create errortext-statistics with an invalid statistic id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send({
                    errortexts: [
                        {
                            _id: mealtimeError.id
                        },
                        {
                            _id: shoppingCartError.id
                        }
                    ],
                    session: {
                        _statisticId: "invalid"
                    }
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to create errortext-statistics with an invalid errortext-id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send({
                    errortexts: [
                        {
                            _id: "invalid"
                        },
                        {
                            _id: shoppingCartError.id
                        }
                    ],
                    session: {
                        _statisticId: statistic.id
                    }
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        });

        it("try to create errortext-statistics with a not existing statistic id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send({
                    errortexts: [
                        {
                            _id: mealtimeError.id
                        },
                        {
                            _id: shoppingCartError.id
                        }
                    ],
                    session: {
                        _statisticId: 9999
                    }
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        });

        it("try to create errortext-statistics with a not existing errortext id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send({
                    errortexts: [
                        {
                            _id: 9999
                        },
                        {
                            _id: shoppingCartError.id
                        }
                    ],
                    session: {
                        _statisticId: statistic.id
                    }
                })
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        });

    });

});
