import { SmtpMessage } from "./SmtpMessage";

/**
 * Template for sending the support information about an erroneous route
 * Params (1):
 * - ::name:: name of the exception
 * - ::message:: message of the exception
 * - ::stack:: stacktrace of the exception
 */
const supportMail = new SmtpMessage();

supportMail.subject = "Bei einer Route ist ein Fehler aufgetreten!";
supportMail.html = "::name:: <br/> <br/>::message:: <br/> <br/>::stack::";
supportMail.text = `
::name::

::message::

::stack::
`;

export { supportMail };
