import request from "supertest";
import app from "../../src/app";
import { seedUsers, truncateTables } from "../../src/migrationHelper";
import { containsMessage } from "../../src/util/testhelper";
import { HttpResponseMessageSeverity } from "../../src/lib/utils/http/HttpResponse";

describe("util/authentication/jwtStrategy Tests", () => {

    beforeAll(async () => {
        await truncateTables();
        await seedUsers();
    });

    it("try to access endpoint with token that has no user attached", async () => {
         const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJmbG9yaWFuLm1vbGRAbGl2ZS5hdCIsInRoZXJhcGlzdCI6ZmFsc2UsImlhdCI6MTU3MzA1NDc1MCwiZXhwIjoxNjA0Njc3MTUwfQ.0D4mEoFX5HvrhMk6cSAa-P-LP-pRkDv_9wN1iSCdmO8";

         const res = await request(app).get("/errortexts")
             .set("Authorization", "Bearer " + token)
             .set("Accept", "application/json")
             .expect("Content-Type", /json/)
             .expect(401);

        expect(res.body._status).toEqual("fail");
        expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

    });
});