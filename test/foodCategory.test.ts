import request from "supertest";
import app from "../src/app";
import {
    seedFoodCategories,
    seedUsers,
    truncateTables
} from "../src/migrationHelper";
import { authenticate, containsMessage } from "../src/util/testhelper";
import { validTherapist } from "../src/seeds/users";
import { HttpResponseMessageSeverity } from "../src/lib/utils/http/HttpResponse";
import { vegetables } from "../src/seeds/foodCategories";

describe("FoodCategoryController Tests", () => {

    describe("GET /food-categories", () => {
        const endpoint = "/food-categories";
        const timeout = 10000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
            await seedFoodCategories();
        });

        it("fetch all food-categories", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("foodCategories");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();
        }, timeout);

        it("try to fetch all food-categories without authentication", async () => {
            const res = await request(app).get(endpoint)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to fetch all food-categories with an expired token", async () => {
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

    describe("GET /food-categories/:id", () => {
        const endpoint = "/food-categories";
        const timeout = 10000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
            await seedFoodCategories();
        }, timeout);

        it("fetch food-category with specific id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/" + vegetables.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("foodCategory");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

            expect(res.body._data.foodCategory._id).toEqual(vegetables.id);
        }, timeout);

        it("try to fetch food-category with id without authentication", async () => {
            const res = await request(app).get(endpoint + "/" + vegetables.id)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        it("try to fetch all food-category with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).get(endpoint + "/" + vegetables.id)
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to fetch food-category with an invalid id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/invalid")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        it("try to fetch food-category with a not existing id", async () => {
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