import request from "supertest";
import app from "../../src/app";
import { UserFacade } from "../../src/db/entity/user/UserFacade";
import { authenticate } from "../../src/util/testhelper";
import { validTherapist } from "../../src/seeds/users";
import { seedErrortexts, seedSeverities, seedUsers, truncateTables } from "../../src/migrationHelper";
import { Mail } from '../../src/util/mail/Mail'
import { Recipient } from '../../src/util/mail/Recipient'
import { mailTransport } from '../../src/util/mail/mailTransport'

describe("db/entity/EntityFacade Tests", () => {

    beforeEach(async () => {
        await truncateTables();
        await seedUsers();
    });

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