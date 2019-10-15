import { HttpResponseMessage, HttpResponseMessageSeverity } from "../lib/utils/http/HttpResponse";

/**
 * file contains functions that are helpful to evaluate test results
 */

/**
 * checks if the given http-response message array contains the given message type with the specified count
 *
 * @param messages messages to check
 * @param messageType messageType to find
 * @param amount amount of messages that should have the type messageType
 */
export function containsMessage(messages: HttpResponseMessage[], messageType: HttpResponseMessageSeverity, amount: number): boolean {
    let i: number = 0;

    for (const message of messages) {
        if (message.severity === messageType) {
            i++;
        }
    }

    return i == amount;
}