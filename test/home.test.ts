import request from "supertest";
import app from "../src/app";

describe("GET /home", () => {
  it("should return 200 OK", (done) => {
    request(app).get("/home")
      .expect(200, done);
  });
});
