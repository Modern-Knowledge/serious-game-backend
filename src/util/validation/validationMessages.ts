
import { HttpResponseMessage, HttpResponseMessageSeverity } from "../../lib/utils/http/HttpResponse";

/**
 * contains validation messages
 *
 * categories:
 * - email
 * - gender
 * - forename
 * - lastname
 * - password
 * - token
 * - id
 * - therapist
 * - date
 * - info
 * - patient
 */
const validationMessages = new Map<string, Map<string, HttpResponseMessage>>();

const categories = [
    "email", "gender", "forename", "lastname", "password", "token", "id", "therapist", "date", "info", "patient"
];

for (const category of categories) {
    validationMessages.set(category, new Map());

}

/**
 * validation messages for email
 */
validationMessages.get("email").set(
    "empty",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Keine E-Mail übergeben!"));

validationMessages.get("email").set(
    "invalid",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Die E-Mail ist nicht gültig!"));

validationMessages.get("email").set(
    "duplicate",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Die E-Mail ist bereits vergeben!"));

/**
 * validation messages for gender
 */
validationMessages.get("gender").set(
    "wrong_value",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Kein gültiges Geschlecht übergeben!"));

/**
 * validation messages for forename
 */
validationMessages.get("forename").set(
    "empty",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Kein Vorname übergeben!"));

validationMessages.get("forename").set(
    "non_alpha",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Der Vorname darf keine Zahlen enthalten!"));

/**
 * validation messages for lastname
 */
validationMessages.get("lastname").set(
    "empty",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Kein Nachname übergeben!"));

validationMessages.get("lastname").set(
    "non_alpha",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Der Nachname darf keine Zahlen enthalten!"));

/**
 * validation messages for password
 */
validationMessages.get("password").set(
    "length",
    new HttpResponseMessage(
        HttpResponseMessageSeverity.DANGER,
        `Das Passwort ist nicht gültig! (mind. ${process.env.PASSWORD_LENGTH} Zeichen)`));

validationMessages.get("password").set(
    "not_matching",
    new HttpResponseMessage(
        HttpResponseMessageSeverity.DANGER,
        `Die beiden Passwörter stimmen nicht überein!`));

validationMessages.get("password").set(
    "confirmation",
    new HttpResponseMessage(
        HttpResponseMessageSeverity.DANGER,
        `Die Passwort Bestätigung ist nicht gültig! (mind. ${process.env.PASSWORD_LENGTH} Zeichen!`));

/**
 * validation messages for token
 */
validationMessages.get("token").set(
    "length",
    new HttpResponseMessage(
        HttpResponseMessageSeverity.DANGER,
        `Das Token ist zu kurz. (genau ${process.env.PASSWORD_TOKEN_LENGTH} Zeichen)`));

validationMessages.get("token").set(
    "format",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Das Token darf nur aus Zahlen bestehen!`));

/**
 * validation messages for id
 */
validationMessages.get("id").set(
    "numeric",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Die ID darf nur Zahlen beinhalten!`));

/**
 * validation messages for therapist
 */
validationMessages.get("therapist").set(
    "value_true",
    new HttpResponseMessage(
        HttpResponseMessageSeverity.DANGER,
        `Diesem Endpoint muss ein/e TherapeutIn übergeben werden!`));

validationMessages.get("therapist").set(
    "value_false",
    new HttpResponseMessage(
        HttpResponseMessageSeverity.DANGER,
        `Diesem Endpoint muss ein/e PatientIn übergeben werden!`));

/**
 * validation messages for date
 */
validationMessages.get("date").set(
    "invalid",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Kein gültiges Datum übergeben!`));

validationMessages.get("date").set(
    "wrong_order",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Der Start muss zeitlich vor dem Ende liegen!`));

/**
 * validation messages for info
 */
validationMessages.get("info").set(
    "empty",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Keine Info übergeben!`));

/**
 * validation messages for patients
 */
validationMessages.get("patient").set(
    "invalid",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Nicht alle übergebenen PatientInnen sind valide!`));

/**
 * retrieves the validationMessage by category and messageName
 * @param category category of the message
 * @param messageName name of the massage
 */
export function retrieveValidationMessage(category: string, messageName: string): HttpResponseMessage {
    return validationMessages.get(category).get(messageName);
}

/**
 * shortcut method for retrieveValidationMessage
 * retrieves the validationMessage by category and messageName
 * @param category category of the message
 * @param messageName name of the massage
 */
export function rVM(category: string, messageName: string): HttpResponseMessage {
    return retrieveValidationMessage(category, messageName);
}

/**
 * converts error array that is produced by express-validator to HttpResponseMessage[] for responding to client
 * @param errors error array that is returned by express validator
 */
export function toHttpResponseMessage(errors: any[]): HttpResponseMessage[] {
    const httpErrors: HttpResponseMessage[] = [];

    for (const error of errors) {
        httpErrors.push(new HttpResponseMessage(error.msg.severity, `${error.msg.message}`));
    }

    return httpErrors;
}
