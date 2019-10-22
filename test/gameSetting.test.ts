import request from "supertest";
import app from "../src/app";
import { dropTables, runMigrations, seedTables, truncateTables } from "../src/migrationHelper";
import { authenticate, containsMessage } from "../src/util/testhelper";
import { validTherapist } from "../src/seeds/users";
import { HttpResponseMessageSeverity } from "../src/lib/utils/http/HttpResponse";
import { game } from "../src/seeds/games";
import { gameSettings } from "../src/seeds/gameSettings";

describe("GET /game-settings", () => {
    const endpoint = "/game-settings";
    const timeout = 10000;
    let authenticationToken: string;

    beforeAll(async () => {
        await dropTables();
        await runMigrations();
        await truncateTables();
        await seedTables();
    });

    it("fetch all game-settings", async () => {
        authenticationToken = await authenticate(validTherapist);

        const res = await request(app).get(endpoint)
            .set("Authorization", "Bearer " + authenticationToken)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        expect(res.body._status).toEqual("success");
        expect(res.body._data).toHaveProperty("token");
        expect(res.body._data).toHaveProperty("gameSettings");
        expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();
    }, timeout);

    it("try to fetch all games without authentication", async () => {
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

describe("GET /game-settings/:id", () => {
    const endpoint = "/game-settings";
    const timeout = 10000;
    let authenticationToken: string;

    beforeAll(async () => {
        await dropTables();
        await runMigrations();
        await truncateTables();
        await seedTables();
    });

    it("fetch game-settings with specific id", async () => {
        authenticationToken = await authenticate(validTherapist);

        const res = await request(app).get(endpoint + "/" + gameSettings.id)
            .set("Authorization", "Bearer " + authenticationToken)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        expect(res.body._status).toEqual("success");
        expect(res.body._data).toHaveProperty("token");
        expect(res.body._data).toHaveProperty("gameSetting");
        expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

        expect(res.body._data.gameSetting._id).toEqual(game.id);

    }, timeout);

    it("try to fetch game-setting with id without authentication", async () => {
        const res = await request(app).get(endpoint + "/" + gameSettings.id)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);

        expect(res.body._status).toEqual("fail");
        expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        const res1 = await request(app).get(endpoint + "/" + gameSettings.id)
            .set("Authorization", "")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);

        expect(res1.body._status).toEqual("fail");
        expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

    }, timeout);

    it("try to fetch game-setting with id and an expired token", async () => {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

        const res = await request(app).get(endpoint + "/" + gameSettings.id)
            .set("Authorization", "Bearer " + token)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);

        expect(res.body._status).toEqual("fail");
        expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
    }, timeout);

    it("try to fetch game-setting with an invalid id", async () => {
        authenticationToken = await authenticate(validTherapist);

        const res = await request(app).get(endpoint + "/invalid")
            .set("Authorization", "Bearer " + authenticationToken)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        expect(res.body._status).toEqual("fail");
        expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
    }, timeout);

    it("try to fetch game-setting with a not existing id", async () => {
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