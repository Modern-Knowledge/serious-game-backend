import request from "supertest";
import app from "../../src/app";
import { UserFacade } from "../../src/db/entity/user/UserFacade";
import { seedUsers, truncateTables } from "../../src/migrationHelper";
import { validTherapist } from "../../src/seeds/users";
import { authenticate } from "../../src/util/testhelper";

describe("db/entity/EntityFacade Tests", () => {
    const timeout = 10000;

    beforeEach(async () => {
        await truncateTables();
        await seedUsers();
    }, timeout);

    // SGBUEF01
    it("try to fetch one result from database where multiple results are existing", async () => {
        const authenticationToken = await authenticate(validTherapist);

        await request(app).get("/errortexts")
            .set("Authorization", "Bearer " + authenticationToken)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        const userFacade = new UserFacade();
        userFacade.filter.addFilterCondition("lastname", "Mustermann");

        try {
            await userFacade.getOne();
        } catch (e) {
            expect(e.message).toContain("More than one result returned! (2)");
        }
    });
});
