import request from "supertest";
import app from "../src/app";
import { dropTables, runMigrations, seedTables, truncateTables } from "../src/migrationHelper";
import { containsMessage } from "../src/util/testhelper";
import { HttpResponseMessageSeverity } from "../src/lib/utils/http/HttpResponse";

const timeout = 100000;

/**
 * Tests for the login-controller
 */
describe("POST /login", () => {
    // drop tables
    beforeAll(async () => {
        return dropTables();
    });

    // run migrations
    beforeAll(async () => {
        return runMigrations();
    });

    // truncate tables
    beforeEach(async () => {
        return truncateTables();
    });

    // seed tables
    beforeEach(async () => {
        return seedTables();
    });

    it("login with correct therapist credentials", async () => {
        const res = await request(app).post("/login")
            .send({email: "therapist@example.org", password: "123456"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        expect(res.body._status).toEqual("success");
        expect(res.body._data).toHaveProperty("token");
        expect(res.body._data).toHaveProperty("user");
        expect(res.body._data.user._email).toEqual("therapist@example.org");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1);
    }, timeout);

    it("login with correct therapist credentials, but therapist was not accepted", async () => {
        const res = await request(app).post("/login")
            .send({email: "therapist1@example.org", password: "123456"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        console.log(res.body);

        expect(res.body._status).toEqual("fail");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.WARNING, 1);
    }, timeout);


    it("login with correct patient credentials", async () => {
        const res = await request(app).post("/login")
            .send({email: "patient@example.org", password: "123456"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        expect(res.body._status).toEqual("success");
        expect(res.body._data).toHaveProperty("token");
        expect(res.body._data).toHaveProperty("user");
        expect(res.body._data.user._email).toEqual("patient@example.org");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1);

    }, timeout);

    it("try to login with no password passed", async () => {
        const res = await request(app).post("/login")
            .send({email: "patient@example.org"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        expect(res.body._status).toEqual("fail");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1);
    }, timeout);

    it("try to login with no email passed", async () => {
        const res = await request(app).post("/login")
            .send({password: "123456"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        expect(res.body._status).toEqual("fail");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1);
    }, timeout);

    it("try to login with no invalid email passed", async () => {
        const res = await request(app).post("/login")
            .send({email: "invalidEmail", password: "123456"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        expect(res.body._status).toEqual("fail");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1);
    }, timeout);

    it("try to login with too short password", async () => {
        const res = await request(app).post("/login")
            .send({email: "patient@example.org", password: "12345"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        expect(res.body._status).toEqual("fail");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1);
    }, timeout);

    it("try to login with invalid credentials", async () => {
        const res = await request(app).post("/login")
            .send({email: "notExistingEmail@mail.com", password: "123456"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(404);

        expect(res.body._status).toEqual("fail");
        containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1);
    }, timeout);

});