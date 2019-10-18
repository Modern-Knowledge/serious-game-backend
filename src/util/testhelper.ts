import { HttpResponseMessageSeverity } from "../lib/utils/http/HttpResponse";
import { User } from "../lib/models/User";
import request from "supertest";
import app from "../app";
import logger from './log/logger'

/**
 * file contains functions that are helpful for testing
 */

/**
 * checks if the given http-response message array contains the given message type with the specified count
 *
 * @param messages messages to check
 * @param messageType messageType to find
 * @param amount amount of messages that should have the type messageType
 */
export function containsMessage(messages: any, messageType: HttpResponseMessageSeverity, amount: number): boolean {
    let i: number = 0;

    for (const message of messages) {
        if (message._severity === messageType) {
            i++;
        }
    }

    return i === amount;
}

/**
 * function that authenticates the given user
 * if authentication was successful, the jwt-token is returned
 *
 * @param user user to authenticate
 */
export async function authenticate(user: User): Promise<string> {

    logger.info("Running authentication for tests");

    const res = await request(app).post("/login")
        .send({email: user.email, password: "123456"})
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200);

    expect(res.body._status).toEqual("success");
    expect(res.body._data).toHaveProperty("token");
    expect(res.body._data).toHaveProperty("user");

    return res.body._data.token;
}