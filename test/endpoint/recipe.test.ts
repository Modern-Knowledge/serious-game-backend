import request from "supertest";
import app from "../../src/app";
import {Recipe} from "../../src/lib/models/Recipe";
import { HttpResponseMessageSeverity } from "../../src/lib/utils/http/HttpResponse";
import {
    seedDifficulties,
    seedRecipes,
    seedUsers,
    truncateTables
} from "../../src/migrationHelper";
import {scrambledEgg} from "../../src/seeds/recipes";
import { validTherapist } from "../../src/seeds/users";
import { authenticate, containsMessage } from "../../src/util/testhelper";

const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwi" +
    "ZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWx" +
    "zZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qv" +
    "VSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

describe("RecipeController Tests", () => {

    describe("GET /recipes", () => {
        const endpoint = "/recipes";
        const timeout = 10000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
            await seedDifficulties();
            await seedRecipes();
        });

        // SGBRC01
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

        // SGBRC02
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

        // SGBRC03
        it("try to fetch all recipes with an expired token", async () => {
            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + expiredToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);
    });

    describe("GET /recipes/:id", () => {
        const endpoint = "/recipes";
        const timeout = 10000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
            await seedDifficulties();
            await seedRecipes();
        });

        // SGBRC04
        it("fetch recipe with specific id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/" + scrambledEgg.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("recipe");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            expect(res.body._data.recipe._id).toEqual(scrambledEgg.id);
        }, timeout);

        // SGBRC05
        it("try to fetch recipe with id without authentication", async () => {
            const res = await request(app).get(endpoint + "/" + scrambledEgg.id)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

            const res1 = await request(app).get(endpoint + "/" + scrambledEgg.id)
                .set("Authorization", "")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res1.body._status).toEqual("fail");
            expect(containsMessage(res1.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBRC06
        it("try to fetch recipe with an expired token", async () => {
            const res = await request(app).get(endpoint + "/" + scrambledEgg.id)
                .set("Authorization", "Bearer " + expiredToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBRC07
        it("try to fetch recipe with an invalid id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/invalid")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBRC08
        it("try to fetch recipe with a not existing id", async () => {
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

    describe("GET /:mealtime/:difficulty", () => {
        const endpoint = "/recipes/";
        const timeout = 10000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
            await seedDifficulties();
            await seedRecipes();
        });

        // SGBRC21
        it("fetch all recipes for the given mealtime and difficulty", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "Abendessen/2")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("recipes");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            res.body._data.recipes.forEach((value: any) => {
                expect(value._mealtime).toEqual("Abendessen");
                expect(value._difficultyId).toEqual(2);
            });

        }, timeout);

        // SGBRC22
        it("try to fetch all recipes without authentication", async () => {
            const res = await request(app).get(endpoint + "Abendessen/2")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBRC23
        it("try to fetch all recipes with an expired token", async () => {
            const res = await request(app).get(endpoint + "Abendessen/2")
                .set("Authorization", "Bearer " + expiredToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBRC24
        it("try to fetch all recipes without a difficulty", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "Abendessen/")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBRC25
        it("try to fetch all recipes with an invalid difficulty", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "Abendessen/invalid")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBRC26
        it("try to fetch all recipes with an invalid mealtime", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "invalid/2")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("recipes");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            expect(res.body._data.recipes).toEqual([]);
        }, timeout);
    });
});
