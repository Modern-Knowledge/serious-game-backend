import request from "supertest";
import app from "../src/app";
import { dropTables, runMigrations, seedTables, truncateTables } from "../src/migrationHelper";
import { authenticate, containsMessage } from "../src/util/testhelper";
import { validTherapist } from "../src/seeds/users";
import { HttpResponseMessageSeverity } from "../src/lib/utils/http/HttpResponse";
import { proteinShake } from "../src/seeds/recipes";

describe("SessionController Tests", () => {

    describe("GET /session/:id", () => {
        const endpoint = "/recipes";
        const timeout = 10000;
        let authenticationToken: string;

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

        it("fetch all recipes", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("recipes");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();
        }, timeout);

        it("try to fetch all recipes without authentication", async () => {
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

        it("try to fetch all recipes with an expired token", async () => {
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
});