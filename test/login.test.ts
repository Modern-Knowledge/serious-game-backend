import request from "supertest";
import app from "../src/app";
import { migrate, truncateTables } from "../src/migrationHelper";

/**
 * Tests for the login-controller
 */
describe("POST /login", () => {
    // seed tables
    beforeEach(async (done) => {
        return truncateTables();
    });

    it("succeeds with correct credentials", (done) => {
        request(app).post("/login")
            .expect(200, done)
            .end((err, res) => {
                if (err) throw err;
        });
    });
});