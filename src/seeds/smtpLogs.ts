import { SmtpLog } from "../lib/models/SmtpLog";

const email = "example@mail.com";

const sentSmtpLog = new SmtpLog();
sentSmtpLog.id = 1;
sentSmtpLog.body = "Body";
sentSmtpLog.rcptEmail = email;
sentSmtpLog.subject = "Betreff";
sentSmtpLog.sent = 1;
sentSmtpLog.simulated = 0;

const simulatedSmtpLog = new SmtpLog();
simulatedSmtpLog.id = 2;
simulatedSmtpLog.body = "Body";
simulatedSmtpLog.rcptEmail = email;
simulatedSmtpLog.subject = "Betreff";
simulatedSmtpLog.sent = 1;
simulatedSmtpLog.simulated = 1;

const notSentSmtpLog = new SmtpLog();
notSentSmtpLog.id = 3;
notSentSmtpLog.body = "Body";
notSentSmtpLog.rcptEmail = email;
notSentSmtpLog.subject = "Betreff";
notSentSmtpLog.sent = 0;
notSentSmtpLog.simulated = 0;

export { sentSmtpLog, simulatedSmtpLog, notSentSmtpLog };
