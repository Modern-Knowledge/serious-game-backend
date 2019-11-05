import request from "supertest";
import app from "../../src/app";
import { seedGames, seedUsers, truncateTables } from "../../src/migrationHelper";
import { authenticate, containsMessage } from "../../src/util/testhelper";
import { validTherapist } from "../../src/seeds/users";
import { HttpResponseMessageSeverity } from "../../src/lib/utils/http/HttpResponse";
import { game } from "../../src/seeds/games";

describe("GameController Tests", () => {

    describe("GET /games", () => {
        const endpoint = "/games";
        const timeout = 20000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
            await seedGames();
        }, 10000);

        // SGBGC01
        it("fetch all games", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("game");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();
        }, timeout);

        // SGBGC02
        it("try to fetch all games without authentication", async () => {
            const res = await request(app).get(endpoint)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBGC03
        it("try to fetch all games with an expired token", async () => {
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

    describe("GET /games/:id", () => {
        const endpoint = "/games";
        const timeout = 10000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
            await seedGames();
        }, 100000);

        // SGBGC04
        it("fetch game with specific id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/" + game.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("game");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            expect(res.body._data.game._id).toEqual(game.id);
        }, timeout);

        // SGBGC05
        it("try to fetch game with id without authentication", async () => {
            const res = await request(app).get(endpoint + "/" + game.id)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBGC06
        it("try to fetch game with id and an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).get(endpoint + "/" + game.id)
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBGC07
        it("try to fetch game with an invalid id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/invalid")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBGC08
        it("try to fetch game with a not existing id", async () => {
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
});