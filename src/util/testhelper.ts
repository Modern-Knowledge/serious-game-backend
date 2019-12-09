import request from "supertest";
import app from "../app";
import { User } from "../lib/models/User";
import { HttpResponseMessageSeverity } from "../lib/utils/http/HttpResponse";
import logger from "./log/logger";

/**
 * Checks if the given http-response message array contains the given message severity.
 *
 * @param messages array of http-messages to check
 * @param messageType message-severity that should be included in the array
 * @param amount determines how often the given severity should be included in the array.
 */
export function containsMessage(messages: any, messageType: HttpResponseMessageSeverity, amount: number): boolean {
    let i = 0;

    for (const message of messages) {
        if (message._severity === messageType) {
            i++;
        }
    }

    return i === amount;
}

/**
 * Authenticates a given user. If a error occurs while authenticating, an error is thrown.
 *
 * @param user user that should be authenticated
 */
export async function authenticate(user: User): Promise<string> {
    logger.info("Running authentication for tests");

    const res = await request(app).post("/login")
    // tslint:disable-next-line:no-hardcoded-credentials
        .send({email: user.email, password: "123456"})
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200);

    expect(res.body._status).toEqual("success");
    expect(res.body._data).toHaveProperty("token");
    expect(res.body._data).toHaveProperty("user");

    return res.body._data.token;
}
