import request from "supertest";
import app from "../src/app";
import { dropTables, runMigrations, seedTables, truncateTables } from "../src/migrationHelper";
import { containsMessage } from "../src/util/testhelper";
import { HttpResponseMessageSeverity } from "../src/lib/utils/http/HttpResponse";
import { TherapistFacade } from "../src/db/entity/user/TherapistFacade";
import * as bcrypt from "bcryptjs";
import { Status } from "../src/lib/enums/Status";

describe("POST /therapists", () => {
    const timeout = 100000;
    const endpoint = "/therapists";

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

    // SGB013
    // todo: check space in (fore|last)name
    it("register new therapist with correct data", async () => {
        const res = await request(app).post("/therapists")
            .send(
                {
                        _email: "newTherapist@mail.com",
                        _forename: "Vorname",
                        _lastname: "Nachname",
                        _password: "123456",
                        password_confirmation: "123456",
                        therapist: "true"
                    }
                )
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(201);

        expect(res.body._status).toEqual("success");
        expect(res.body._data).toHaveProperty("token");
        expect(res.body._data).toHaveProperty("user");
        expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();

        const therapistId = res.body._data.user._id;

        const therapistFacade = new TherapistFacade();
        const therapist = await therapistFacade.getById(therapistId);

        expect(therapist).not.toBeUndefined();

        if (therapist) {
            expect(therapist.failedLoginAttempts).toEqual(0);
            expect(therapist.accepted).toBeFalsy();
            expect(therapist.status).toEqual(Status.ACTIVE);

            const compPasswords = bcrypt.compareSync("123456", therapist.password);
            expect(compPasswords).toBeTruthy();
        }

    }, timeout);
});