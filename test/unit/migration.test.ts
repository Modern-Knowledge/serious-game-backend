import request from "supertest";
import app from "../../src/app";
import { GameFacade } from "../../src/db/entity/game/GameFacade";
import { ErrortextFacade } from "../../src/db/entity/helptext/ErrortextFacade";
import { HelptextFacade } from "../../src/db/entity/helptext/HelptextFacade";
import { UserFacade } from "../../src/db/entity/user/UserFacade";
import {
    dropTables,
    migrate,
    seedTables,
    truncateTables
} from "../../src/migrationHelper";

describe("migrationHelper Tests", () => {
    const timeout = 10000;

    beforeAll(async () => {
        await migrate();
    }, timeout);

    // SGBUMH01
    it("test running migrations", async () => {

        await request(app).get("/errortexts")
            .set("Authorization", "Bearer ")
            .set("Accept", "application/json");

        // check database
        const errortextFacade = new ErrortextFacade();
        const errortexts = await errortextFacade.get();

        expect(errortexts.length).not.toBe(0);

        const helptextFacade = new HelptextFacade();
        const helptexts = await helptextFacade.get();

        expect(helptexts.length).not.toBe(0);

        const userFacade = new UserFacade();
        const users = await userFacade.get();

        expect(users.length).not.toBe(0);

        const gameFacade = new GameFacade();
        const games = await gameFacade.get();

        expect(games.length).not.toBe(0);
    }, timeout);

    // SGBUMH02
    it("test truncating tables without tables", async () => {
        await dropTables();

        await request(app).get("/errortexts")
            .set("Authorization", "Bearer ")
            .set("Accept", "application/json");

        const res = await truncateTables();
        expect(res).toEqual(0);
    });

    // SGBUMH03
    it("test dropping tables without tables", async () => {
        await dropTables();

        await request(app).get("/errortexts")
            .set("Authorization", "Bearer ")
            .set("Accept", "application/json");

        const res = await dropTables();
        expect(res).toEqual(0);
    });

    // SGBUMH04
    it("test seeding tables without tables", async () => {
        await dropTables();

        await request(app).get("/errortexts")
            .set("Authorization", "Bearer ")
            .set("Accept", "application/json");

        const res = await seedTables();
        expect(res).toEqual(0);
    });

    afterEach(async () => {
        await migrate();
    }, timeout);

});
