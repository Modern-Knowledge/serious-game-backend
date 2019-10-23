

import { SmtpMessage } from "./SmtpMessage";

/**
 * Template for sending the user an E-Mail with the reset-token for the password
 * Params (3):
 * - ::name:: name of the recipient
 * - ::code:: reset-token for resetting the password
 * - ::validUntil:: day when the token expires
 */
const passwordReset = new SmtpMessage();

passwordReset.subject = "Zurücksetzen des Passwortes";

passwordReset.html = `
<h2>Sehr geehrte/r ::name::</h2>
<p>Wir haben Ihre Anfrage zum Zurücksetzen des Passwortes erhalten. Geben Sie folgenden Code zum Zurücksetzen des Passwortes ein:</p>
<p>::code::</p>
<p>Der Code ist gültig bis: ::validUntil::</p>

<b>Sie haben diese Änderung nicht beantragt?</b>
<p>Falls Sie kein neues Passwort beantragt haben, können Sie diese E-Mail ignorieren.</p>
`;

passwordReset.text = `
Sehr geehrte/r ::name::

Wir haben Ihre Anfrage zum Zurücksetzen des Passwortes erhalten. Geben Sie folgenden Code zum Zurücksetzen des Passwortes ein:
::code::

Der Code ist gültig bis: ::validUntil::

Sie haben diese Änderung nicht beantragt?
Falls Sie kein neues Passwort beantragt haben, können Sie diese E-Mail ignorieren.
`;

export { passwordReset };
