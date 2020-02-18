import request from "supertest";
import app from "../../src/app";
import { HttpResponseMessageSeverity } from "../../src/lib/utils/http/HttpResponse";
import { validAdminTherapist, validTherapist } from "../../src/seeds/users";
import { authenticate, containsMessage } from "../../src/util/testhelper";

const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwi" +
    "ZW1haWwiOiJwYXRpZW50QGV4YW1wbGUub3JnIiwidGhlcmFwaXN0IjpmYWx" +
    "zZSwiaWF0IjoxNTcxNTE4OTM2LCJleHAiOjE1NzE1MTg5Mzd9.7cZxI_6qv" +
    "VSL3xhSl0q54vc9QH7JPB_E1OyrAuk1eiI";

describe("LogController Tests", () => {

    describe("GET /logs", () => {
        const endpoint = "/logs";
        const timeout = 10000;
        let authenticationToken: string;

        // SGBFLC01
        it("fetch all log-files from the file-system", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("files");

            res.body._data.files.forEach((value: any) => {
                expect(value).toHaveProperty("file");
                expect(value).toHaveProperty("size");

            });

            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();
        }, timeout);

        // SGBFLC02
        it("try to fetch all logs-files without authentication", async () => {
            const res = await request(app).get(endpoint)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBFLC03
        it("try to fetch all log-files with an expired token", async () => {
            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + expiredToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBFLC04
        it("try to fetch all logs with no therapist admin", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

    });

    describe("GET /logs/:name", () => {
        const endpoint = "/logs";
        const timeout = 10000;
        let authenticationToken: string;

        // SGBFLC05
        it("fetch log-file content with name", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const logs = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            const filename = logs.body._data.files[0].file;

            const res = await request(app).get(endpoint + "/" + filename)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("content");

            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();
        }, timeout);

        // SGBFLC06
        it("fetch log-file content with name and log-level", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const logs = await request(app).get(endpoint)
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            const filename = logs.body._data.files[0].file;

            const res = await request(app).get(endpoint + "/" + filename + "?level=error")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(res.body._data).toHaveProperty("content");
            if(res.body._data.content.length > 0) {
                res.body._data.content.forEach((value: any) => {
                    expect(value.level).toEqual("error");
                });
            }

            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();
        }, timeout);

        // SGBFLC07
        it("try to fetch log-file content with name without authentication", async () => {
            const res = await request(app).get(endpoint + "/error")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBFLC08
        it("try to fetch log-file content with an expired token", async () => {
            const res = await request(app).get(endpoint + "/error")
                .set("Authorization", "Bearer " + expiredToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBFLC09
        it("try to fetch log-file content with no therapist admin", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).get(endpoint  + "/error")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        // SGBFLC10
        it("try to fetch log-file content with a file name that does not exist", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).get(endpoint + "/notFound")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
        }, timeout);

    });

    describe("DELETE /logs/:name", () => {
        const endpoint = "/logs";
        const timeout = 10000;
        let authenticationToken: string;

        //
        it("clear content of log-file", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).delete(endpoint + "/error")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body._status).toEqual("success");
            expect(res.body._data).toHaveProperty("token");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.SUCCESS, 1)).toBeTruthy();
        }, timeout);

        //
        it("try to clear content of log-file without authentication", async () => {

            const res = await request(app).delete(endpoint + "/error")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        //
        it("try to clear content of log-file with an expired token", async () => {
            const res = await request(app).delete(endpoint + "/error")
                .set("Authorization", "Bearer " + expiredToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        //
        it("try to clear content of log-file without an admin therapist", async () => {
            authenticationToken = await authenticate(validTherapist);

            const res = await request(app).delete(endpoint + "/error")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(403);

            expect(res.body._status).toEqual("fail");
            expect(containsMessage(res.body._messages, HttpResponseMessageSeverity.DANGER, 1)).toBeTruthy();

        }, timeout);

        //
        it("try to clear content of log-file with a file name that does not exist", async () => {
            authenticationToken = await authenticate(validAdminTherapist);

            const res = await request(app).delete(endpoint + "/notFound")
                .set("Authorization", "Bearer " + authenticationToken)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(500);

            expect(res.body._status).toEqual("error");
        }, timeout);

    });
});
