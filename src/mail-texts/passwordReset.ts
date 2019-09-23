/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { SmtpMessage } from "./SmtpMessage";

const passwordReset = new SmtpMessage();

passwordReset.subject = "Zurücksetzen des Passwortes";

passwordReset.html = `
<h2>Hallo ::name::</h2>
<p>Wir haben eine Anfrage zum Zurücksetzen deines Passwortes erhalten. Gib folgenden Code zum Zurücksetzen des Passwortes ein:</p>
<p>::code::</p>

<b>Du hast diese Änderung nicht beantragt?</b>
<p>Falls Sie kein neues Passwort beantragt haben, können Sie diese E-Mail ignorieren.</p>
`;

passwordReset.text = `
Hallo ::name::

Wir haben eine Anfrage zum Zurücksetzen deines Passwortes erhalten. Gib folgenden Code zum Zurücksetzen des Passwortes ein:
::code::

Du hast diese Änderung nicht beantragt?
Falls Sie kein neues Passwort beantragt haben, können Sie diese E-Mail ignorieren.
`;

export default passwordReset;
