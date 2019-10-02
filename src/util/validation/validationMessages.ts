/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */
import { HttpResponseMessage, HttpResponseMessageSeverity } from "../http/HttpResponse";
import logger from "../log/logger";
import { loggerString } from "../Helper";

/**
 * contains validation messages
 *
 * categories:
 * - email
 * - password
 * - token
 */
const validationMessages = new Map<string, Map<string, HttpResponseMessage>>();

validationMessages.set("email", new Map());
validationMessages.set("password", new Map());
validationMessages.set("token", new Map());

validationMessages.get("email").set("invalid", new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Die E-Mail ist nicht gültig!"));

validationMessages.get("password").set("length", new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Das Passwort ist nicht gültig! (mind. ${process.env.PASSWORD_LENGTH} Zeichen)`));

validationMessages.get("token").set("length", new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Das Token ist zu kurz. (genau ${process.env.PASSWORD_TOKEN_LENGTH} Zeichen)`));
validationMessages.get("token").set("format", new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Das Token darf nur aus Zahlen bestehen!`));


/**
 * retrieves the validationMessage by category and messageName
 * @param category category of the message
 * @param messageName name of the massage
 */
export function retrieveValidationMessage(category: string, messageName: string): HttpResponseMessage {
    return validationMessages.get(category).get(messageName);
}

/**
 * converts error array that is produced by express-validator to HttpResponseMessage[] for responding to client
 * @param errors error array that is returned by express validator
 */
export function toHttpResponseMessage(errors: any[]): HttpResponseMessage[] {
    const httpErrors: HttpResponseMessage[] = [];

    for (const error of errors) {
        httpErrors.push(new HttpResponseMessage(error.msg.severity, `${error.msg.message} (${error.param !== "password" ? error.value : ""})`));
    }

    return httpErrors;
}

/**
 * logs errors to console that are produced by express-validator
 * @param endpoint endpoint that reports the errors
 * @param errors error array that is returned by express validator
 */
export function logValidatorErrors(endpoint: string, errors: any[]): void {
    for (const error of errors) {
        logger.debug(`${loggerString()} ${endpoint}: Parameter: ${error.param}, Ort: ${error.location}, Text: ${error.msg.message}, Wert: ${error.param !== "password" ? error.value : ""}`);
    }
}