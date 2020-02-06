
import { SmtpMessage } from "./SmtpMessage";

/**
 * Template for sending the user an E-Mail after he/her has registered. <br/>
 * Params (1):
 * - ::name:: name of the recipient
 */
const register = new SmtpMessage();

register.subject = "Registrierung: Plan your Day";

register.html = `
<h2>Sehr geehrte/r ::name::</h2>

<p>Sie haben sich erfolgreich bei Plan your Day registriert.</p>

<p>Ab jetzt können Sie die App uneingeschränkt verwenden.</p>
`;

register.text = `
Sehr geehrte/r ::name::

Sie haben sich erfolgreich bei Plan your Day registriert.

Ab jetzt können Sie die App verwenden.
`;

export { register };
