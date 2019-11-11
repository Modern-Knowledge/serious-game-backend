
import { SmtpMessage } from "./SmtpMessage";

/**
 * Template for sending the user an E-Mail after the password was resettet
 * Params (3):
 * - ::name:: name of the recipient
 * - ::date_time_resetted:: datetime when the reset has taken place
 * - ::support_mail:: support mail of the application
 */
const passwordResettet = new SmtpMessage();

passwordResettet.subject = "Ihr Passwort wurde zurückgesetzt!";

passwordResettet.html = `
<h2>Sehr geehrte/r ::name::</h2>
<p>Ihr Password wurde am ::date_time_resetted:: zurückgesetzt.</p>
<p><b>Wenn Sie das nicht waren</b>, dann können Sie diese E-Mail ignorieren.</p>
<p><b>Wenn Sie die Änderung nicht beantragt haben</b>, dann wenden Sie sich an den Support.</p>
<p><b>Kontaktieren Sie uns!:</b> ::support_mail::</p>
`;

passwordResettet.text = `
Sehr geehrte/r ::name::

Ihr Password wurde am ::date_time_resetted:: zurückgesetzt.

Wenn Sie das nicht waren, dann können Sie diese E-Mail ignorieren.
Wenn Sie die Änderung nicht beantragt haben, dann wenden Sie sich an den Support.

Kontaktieren Sie uns: ::support_mail::
`;

export { passwordResettet };
