import request from "supertest";
import app from "../../src/app";
import {
    seedDifficulties, seedGames,
    seedGameSettings,
    seedSessions, seedStatistics,
    seedUsers,
    truncateTables
} from "../../src/migrationHelper";
import { authenticate, containsMessage } from "../../src/util/testhelper";
import { validPatient, validTherapist } from "../../src/seeds/users";
import { HttpResponseMessageSeverity } from "../../src/lib/utils/http/HttpResponse";
import { session } from "../../src/seeds/sessions";
import { SessionFacade } from "../../src/db/entity/game/SessionFacade";
import { game } from "../../src/seeds/games";
import { gameSettings } from "../../src/seeds/gameSettings";

describe("SessionController Tests", () => {

    describe("GET /sessions/:id", () => {
        const endpoint = "/sessions";
        const timeout = 20000;
        let authenticationToken: string;

        // clear database
        beforeAll(async () => {
            await truncateTables();
        }, timeout);

        // seed tables
        beforeAll(async () => {
            await seedDifficulties();
            await seedGames();
            await seedGameSettings();
            await seedUsers();
            await seedStatistics();
            await seedSessions();
        }, timeout);

        it("fetch session with id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/" + session.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("session");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            expect(res.body._data.session._id).toEqual(session.id);
        }, timeout);

        it("try to fetch session with id without authentication", async () => {
            const res = await request(app).get(endpoint + "/" + session.id)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).get(endpoint + "/" + session.id)
                .set("Authorization", "")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to fetch session by id with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).get(endpoint + "/" + session.id)
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to fetch session with an invalid id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/invalid")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to fetch session with a not existing id", async () => {
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

    describe("GET /sessions/patient/:id", () => {
        const endpoint = "/sessions/patient";
        const timeout = 20000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedDifficulties();
            await seedGames();
            await seedGameSettings();
            await seedUsers();
            await seedStatistics();
            await seedSessions();
        }, timeout);

        it("fetch session by patient id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/" + validPatient.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("sessions");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

        }, timeout);

        it("try to fetch session by patient id without authentication", async () => {
            const res = await request(app).get(endpoint + "/" + validPatient.id)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).get(endpoint + "/" + validPatient.id)
                .set("Authorization", "")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to fetch session by patient id with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).get(endpoint + "/" + validPatient.id)
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to fetch session with an invalid patient id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/invalid")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to fetch session with a not existing patient id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/" + 9999)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data.sessions).toHaveLength(0);
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();
        }, timeout);
    });

    describe("DELETE /sessions/:id", () => {
        const endpoint = "/sessions";
        const timeout = 10000;
        let authenticationToken: string;

        beforeEach(async () => {
            return truncateTables();
        }, timeout);

        beforeEach(async () => {
            await seedDifficulties();
            await seedGames();
            await seedGameSettings();
            await seedUsers();
            await seedStatistics();
            await seedSessions();
        }, timeout);

        it("successfully delete session", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).delete(endpoint + "/" + session.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            // check if session was deleted
            const sessionFacade = new SessionFacade();
            const fSession = await sessionFacade.getById(session.id);
            expect(fSession).toBeUndefined();

        }, timeout);

        it("try to delete session without authentication", async () => {
            const res = await request(app).delete(endpoint + "/" + session.id)
                .set("Authorization", "")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).delete(endpoint + "/" + session.id)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to delete session with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).delete(endpoint + "/" + session.id)
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to delete session with patient user", async () => {
            authenticationToken = await authenticate(validPatient);

            const res = await request(app).delete(endpoint + "/" + session.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to delete session with an invalid id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).delete(endpoint + "/invalid")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to delete session with a not existing id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).delete(endpoint + "/" + 9999)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to delete session without an id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).delete(endpoint + "/")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("error");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);
    });

    describe("POST /sessions/", () => {
        const endpoint = "/sessions/";
        const timeout = 10000;
        let authenticationToken: string;

        beforeEach(async () => {
            return truncateTables();
        });

        // seed tables
        beforeEach(async () => {
            await seedDifficulties();
            await seedGames();
            await seedGameSettings();
            await seedUsers();
            await seedStatistics();
        });

        it("successfully create new session", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send(
                    {
                        _gameId: game.id,
                        _patientId: validPatient.id,
                        _gameSettingId: gameSettings.id,
                        _elapsedTime: 500
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("session");

            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            // check if session was inserted
            const sessionId = res.body._data.session._id;

            const sessionFacade = new SessionFacade();
            const session = await sessionFacade.getById(sessionId);

            expect(session).not.toBeUndefined();

            if (session) {
                expect(session.gameId).toEqual(game.id);
                expect(session.patientId).toEqual(validPatient.id);
                expect(session.gameSettingId).toEqual(gameSettings.id);
            }

        }, timeout);

        it("try to create session without authentication", async () => {
            const res = await request(app).post(endpoint)
                .send(
                    {
                        _gameId: game.id,
                        _patientId: validPatient.id,
                        _gameSettingId: gameSettings.id,
                        _elapsedTime: 500
                    }
                )
                .set("Authorization", "")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).post(endpoint)
                .send(
                    {
                        _gameId: game.id,
                        _patientId: validPatient.id,
                        _gameSettingId: gameSettings.id,
                        _elapsedTime: 500
                    }
                )
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create session with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).post(endpoint)
                .send(
                    {
                        _gameId: game.id,
                        _patientId: validPatient.id,
                        _gameSettingId: gameSettings.id,
                        _elapsedTime: 500
                    }
                )
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create new session without a game id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send(
                    {
                        _patientId: validPatient.id,
                        _gameSettingId: gameSettings.id,
                        _elapsedTime: 500
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create new session without a patient id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send(
                    {
                        _gameId: game.id,
                        _gameSettingId: gameSettings.id,
                        _elapsedTime: 500
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create new session without a game-setting id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send(
                    {
                        _gameId: game.id,
                        _patientId: validPatient.id,
                        _elapsedTime: 500
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create new session without data", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send({})
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 4)).toBeTruthy();

        }, timeout);

        it("try to create new session with an invalid game id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send(
                    {
                        _gameId: "invalid",
                        _patientId: validPatient.id,
                        _gameSettingId: gameSettings.id,
                        _elapsedTime: 500
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create new session with an invalid patient id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send(
                    {
                        _gameId: game.id,
                        _patientId: "invalid",
                        _gameSettingId: gameSettings.id,
                        _elapsedTime: 500
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create new session with an invalid game setting id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send(
                    {
                        _gameId: game.id,
                        _patientId: validPatient.id,
                        _gameSettingId: "invalid",
                        _elapsedTime: 500
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create new session with a not existing game id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send(
                    {
                        _gameId: 9999,
                        _patientId: validPatient.id,
                        _gameSettingId: gameSettings.id,
                        _elapsedTime: 500
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create new session with a not existing patient id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send(
                    {
                        _gameId: game.id,
                        _patientId: 9999,
                        _gameSettingId: gameSettings.id,
                        _elapsedTime: 500
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create new session with a not existing gameSetting id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send(
                    {
                        _gameId: game.id,
                        _patientId: validPatient.id,
                        _gameSettingId: 9999,
                        _elapsedTime: 500
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create new session with no elapsed time", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send(
                    {
                        _gameId: game.id,
                        _patientId: validPatient.id,
                        _gameSettingId: gameSettings.id,
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to create new session with an invalid elapsed time", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).post(endpoint)
                .send(
                    {
                        _gameId: game.id,
                        _patientId: validPatient.id,
                        _gameSettingId: gameSettings.id,
                        _elapsedTime: -1
                    }
                )
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

    });
});