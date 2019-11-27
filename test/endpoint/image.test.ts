import request from "supertest";
import app from "../../src/app";
import { HttpResponseMessageSeverity } from "../../src/lib/utils/http/HttpResponse";
import { seedImages, seedUsers, truncateTables } from "../../src/migrationHelper";
import { containsMessage } from "../../src/util/testhelper";

describe("ImageController Tests", () => {

    describe("GET /images/:id", () => {
        const endpoint = "/images";
        const timeout = 10000;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
            await seedImages();
        }, timeout);

        // SGBIMC01
        it("fetch image with id", async () => {
            const res = await request(app).get(endpoint + "/" + 1)
                .set("Accept", "application/json")
                .expect("Content-Type", "image/png")
                .expect(200);

            expect(res.body).not.toBeUndefined();
        }, timeout);

        // SGBIMC02
        it("try to fetch image with an invalid id", async () => {
            const res = await request(app).get(endpoint + "/invalid")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBIMC03
        it("try to fetch image with a not existing id", async () => {
            const res = await request(app).get(endpoint + "/" + 9999)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);
    });

});
