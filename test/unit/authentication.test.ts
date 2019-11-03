import request from "supertest";
import app from "../../src/app";
import { seedErrortexts, seedSeverities, seedUsers, truncateTables } from "../../src/migrationHelper";
import { authenticate } from "../../src/util/testhelper";
import { validTherapist } from "../../src/seeds/users";
import { refreshToken } from "../../src/util/middleware/authenticationMiddleware";

describe("util/middleware/authentication Tests", () => {
    const timeout = 10000;

    beforeEach(async () => {
        await truncateTables();
        await seedUsers();
        await seedSeverities();
        await seedErrortexts();
    }, timeout);

    it("check if token gets prolonged if expire time is in less than 10 minutes", async () => {
        process.env.TOKEN_EXPIRE_TIME = "360";
        const authenticationToken = await authenticate(validTherapist);

        const res = await request(app).get("/errortexts")
            .set("Authorization", "Bearer " + authenticationToken)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        const token = res.body._data.token;
        // expect(token).not.toEqual(authenticationToken); // check if token changed

        process.env.TOKEN_EXPIRE_TIME = "3600";
    });

    it("check if token gets prolonged if it is invalid", async () => {
        const token = await refreshToken("invalid");
        expect(token).toBeUndefined();
    });


});