import request from "supertest";
import app from "../../src/app";
import { seedErrortexts, seedSeverities, seedUsers, truncateTables } from "../../src/migrationHelper";
import { validTherapist } from "../../src/seeds/users";
import { refreshToken } from "../../src/util/middleware/authenticationMiddleware";
import { authenticate } from "../../src/util/testhelper";

describe("util/middleware/authentication Tests", () => {
    const timeout = 20000;

    beforeEach(async () => {
        await truncateTables();
        await seedUsers();
        await seedSeverities();
        await seedErrortexts();
    }, timeout);

    // SGBUA01
    it("check if token gets prolonged if expire time is in less than 10 minutes", async () => {
        const currentEnv = process.env;
        process.env = {TOKEN_EXPIRE_TIME: "800", SECRET_KEY: "123456"};
        const authenticationToken = await authenticate(validTherapist);

        const delay = (ms: number) => {
            return new Promise( (resolve) => setTimeout(resolve, ms) );
        };

        await delay(2000);

        const res = await request(app).get("/errortexts")
            .set("Authorization", "Bearer " + authenticationToken)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        const token = res.body._data.token;

        expect(token).not.toEqual(authenticationToken); // check if token changed

        process.env = currentEnv;
    }, timeout);

    // SGBUA02
    it("check if token gets prolonged if it is invalid", async () => {
        const token = await refreshToken("invalid");
        expect(token).toBeUndefined();
    });

});
