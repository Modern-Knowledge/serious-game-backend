import request from "supertest";
import app from "../src/app";

describe("VersionController Tests", () => {

    describe("GET /version", () => {
        const endpoint = "/version";
        const timeout = 10000;

        it("fetch version", async () => {
            const res = await request(app).get(endpoint)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("authors");
        }, timeout);

    });
});