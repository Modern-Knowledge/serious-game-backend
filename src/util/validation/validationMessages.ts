
import { HttpResponseMessage, HttpResponseMessageSeverity } from "../../lib/utils/http/HttpResponse";

/**
 * Map contains categorized validation messages.
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
 * - errortext
 */
const validationMessages = new Map<string, Map<string, HttpResponseMessage>>();

const categories = [
    "email", "gender", "forename", "lastname", "password", "token", "id", "therapist", "date", "info", "patient",
    "errortext"
];

for (const category of categories) {
    validationMessages.set(category, new Map());

}

/**
 * Validation messages for email.
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
 * Validation messages for gender.
 */
validationMessages.get("gender").set(
    "wrong_value",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Kein gültiges Geschlecht übergeben!"));

/**
 * Validation messages for forename.
 */
validationMessages.get("forename").set(
    "empty",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Kein Vorname übergeben!"));

validationMessages.get("forename").set(
    "non_alpha",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Der Vorname darf keine Zahlen enthalten!"));

/**
 * Validation messages for lastname.
 */
validationMessages.get("lastname").set(
    "empty",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Kein Nachname übergeben!"));

validationMessages.get("lastname").set(
    "non_alpha",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Der Nachname darf keine Zahlen enthalten!"));

/**
 * Validation messages for password.
 */
validationMessages.get("password").set(
    "length",
    new HttpResponseMessage(
        HttpResponseMessageSeverity.DANGER,
        `Das Passwort ist nicht gültig! (mind. ${process.env.PASSWORD_LENGTH} Zeichen)`)
);

validationMessages.get("password").set(
    "old_length",
    new HttpResponseMessage(
        HttpResponseMessageSeverity.DANGER,
        `Das alte Passwort ist nicht gültig! (mind. ${process.env.PASSWORD_LENGTH} Zeichen)`)
);

validationMessages.get("password").set(
    "new_length",
    new HttpResponseMessage(
        HttpResponseMessageSeverity.DANGER,
        `Die Bestätigung des neuen Passwort ist nicht gültig! (mind. ${process.env.PASSWORD_LENGTH} Zeichen)`)
);

validationMessages.get("password").set(
    "not_matching",
    new HttpResponseMessage(
        HttpResponseMessageSeverity.DANGER,
        `Die beiden Passwörter stimmen nicht überein!`)
);

validationMessages.get("password").set(
    "confirmation",
    new HttpResponseMessage(
        HttpResponseMessageSeverity.DANGER,
        `Die Passwort Bestätigung ist nicht gültig! (mind. ${process.env.PASSWORD_LENGTH} Zeichen!`)
);

/**
 * Validation messages for token.
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
 * Validation messages for id.
 */
validationMessages.get("id").set(
    "numeric",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Die ID darf nur Zahlen beinhalten!`));

/**
 * Validation messages for therapist.
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
 * Validation messages for date.
 */
validationMessages.get("date").set(
    "invalid",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Kein gültiges Datum übergeben!`));

validationMessages.get("date").set(
    "wrong_order",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Der Start muss zeitlich vor dem Ende liegen!`));

/**
 * Validation messages for info.
 */
validationMessages.get("info").set(
    "empty",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Keine Info übergeben!`));

/**
 * Validation messages for patients.
 */
validationMessages.get("patient").set(
    "invalid",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Nicht alle übergebenen PatientInnen sind valide!`));

/**
 * Validation messages for errortexts.
 */
validationMessages.get("errortext").set(
    "errortext_id",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Keine gültige Fehlertext Id übergeben!`));

validationMessages.get("errortext").set(
    "statistic_id",
    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Keine gültige Statistik Id übergeben!`));

/**
 * Retrieves the validationMessage by category and message-name.
 *
 * @param category category of the message
 * @param messageName name of the massage
 */
export function retrieveValidationMessage(category: string, messageName: string): HttpResponseMessage {
    return validationMessages.get(category).get(messageName);
}

/**
 * Shortcut method for retrieving validation messages.
 * Retrieves the validationMessage by category and message-name.
 *
 * @param category category of the message
 * @param messageName name of the massage
 */
export function rVM(category: string, messageName: string): HttpResponseMessage {
    return retrieveValidationMessage(category, messageName);
}

/**
 * Converts an error-array that was produced by express-validator to HttpResponseMessage[]. The http-message
 * array is sent back to the client.
 *
 * @param errors array of errors that are returned by the express validator
 */
export function toHttpResponseMessage(errors: any[]): HttpResponseMessage[] {
    const httpErrors: HttpResponseMessage[] = [];

    for (const error of errors) {
        httpErrors.push(new HttpResponseMessage(error.msg.severity, `${error.msg.message}`));
    }

    return httpErrors;
}
