import request from "supertest";
import app from "../../src/app";
import { seedImages, seedUsers, truncateTables } from "../../src/migrationHelper";
import { authenticate, containsMessage } from "../../src/util/testhelper";
import { validTherapist } from "../../src/seeds/users";
import { HttpResponseMessageSeverity } from "../../src/lib/utils/http/HttpResponse";
import { image } from "../../src/seeds/images";

describe("ImageController Tests", () => {

    describe("GET /images/:id", () => {
        const endpoint = "/images";
        const timeout = 10000;
        let authenticationToken: string;

        beforeAll(async () => {
            await truncateTables();
            await seedUsers();
            await seedImages();
        }, timeout);

        // SGBIMC01
        it("fetch image with id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/" + image.id)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", "image/png")
                .expect(200);

            expect(res.body).not.toBeUndefined();
        }, timeout);

        // SGBIMC02
        it("try to fetch image without authentication", async () => {
            const res = await request(app).get(endpoint + "/" + image.id)
                .set("Authorization", "")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBIMC03
        it("try to fetch image with an expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWxzZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qvVSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

            const res = await request(app).get(endpoint + "/" + image.id)
                .set("Authorization", "Bearer " + token)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBIMC04
        it("try to fetch image with an invalid id", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint + "/invalid")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();
        }, timeout);

        // SGBIMC05
        it("try to fetch image with a not existing id", async () => {
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