import { checkEnvFunction } from "../../src/util/analysis/checkEnvVariables";

describe("util/mail/analysis/checkEnvVariables Tests", () => {

    // SGBUCEV01
    it("check env variables with required environment variables missing!", async () => {
        const currentEnv = process.env;
        process.env = {DB_HOST: "localhost", DB_USER: "user", DB_PASS: "pass", DB_DATABASE: "database",
            VERSION: "1.1", PASSWORD_TOKEN_LENGTH: "6", PASSWORD_LENGTH: "8",
            TEST_DB_HOST: "localhost", TEST_DB_USER: "user", TEST_DB_DATABASE: "database",
            DB_CONNECTION_LIMIT: "100"
        };

        const t = () => {
           checkEnvFunction();
        };

        expect(t).toThrow(Error);
        process.env = currentEnv;
    });

    // SGBUCEV02
    it("check env variables with optional environment variables missing!", async () => {
        const currentEnv = process.env;
        process.env = {DB_HOST: "localhost", DB_USER: "user", DB_PASS: "pass",
            DB_DATABASE: "database", VERSION: "1.1", PASSWORD_TOKEN_LENGTH: "6",
            PASSWORD_LENGTH: "8", TEST_DB_HOST: "localhost", TEST_DB_USER: "user",
            TEST_DB_PASS: "pass", TEST_DB_DATABASE: "database", SECRET_KEY: "123456",
            DB_CONNECTION_LIMIT: "100"
        };

        checkEnvFunction();

        process.env = currentEnv;
    });

    // SGBUCEV03
    it("check env variables with mail environment variables missing!", async () => {
        const currentEnv = process.env;
        process.env = {DB_HOST: "localhost", DB_USER: "user", DB_PASS: "pass", DB_DATABASE: "database",
            VERSION: "1.1", PASSWORD_TOKEN_LENGTH: "6", PASSWORD_LENGTH: "8",
            TEST_DB_HOST: "localhost", TEST_DB_USER: "user", TEST_DB_PASS: "pass",
            TEST_DB_DATABASE: "database", SEND_MAILS: "1", SECRET_KEY: "123456",
            DB_CONNECTION_LIMIT: "100"
        };

        checkEnvFunction();

        expect(process.env.SEND_MAILS).toEqual("0");
        process.env = currentEnv;
    });
});
