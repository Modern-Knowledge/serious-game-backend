/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */
import { HttpResponseMessage, HttpResponseMessageSeverity } from "../http/HttpResponse";

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

validationMessages.get("password").set("invalid", new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Das Passwort ist nicht gültig!"));
validationMessages.get("password").set("criteria", new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Das Passwort entspricht nicht den vorgegebenen Kriterien!"));

validationMessages.get("token").set("invalid", new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Das Token ist nicht gültig!"));

/**
 * retrieves the validationMessage by category and messageName
 * @param category category of the message
 * @param messageName name of the massage
 */
export function retrieveValidationMessage(category: string, messageName: string): HttpResponseMessage {
    return validationMessages.get(category).get(messageName);
}

/**
 * converts error[] that is produced by express-validator to HttpResponseMessage[]
 * @param errors
 */
export function toHttpResponseMessage(errors: any[]): HttpResponseMessage[] {
    const httpErrors: HttpResponseMessage[] = [];

    for (const error of errors) {
        httpErrors.push(new HttpResponseMessage(error.msg.severity, `${error.msg.message} (${error.value})`));
    }

    return httpErrors;
}
