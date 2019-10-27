import { SmtpLog } from "../lib/models/SmtpLog";

const sentSmtpLog = new SmtpLog();
sentSmtpLog.id = 1;
sentSmtpLog.body = "Body";
sentSmtpLog.rcptEmail = "example@mail.com";
sentSmtpLog.subject = "Betreff";
sentSmtpLog.sent = 1;
sentSmtpLog.simulated = 0;

const simulatedSmtpLog = new SmtpLog();
simulatedSmtpLog.id = 2;
simulatedSmtpLog.body = "Body";
simulatedSmtpLog.rcptEmail = "example@mail.com";
simulatedSmtpLog.subject = "Betreff";
simulatedSmtpLog.sent = 1;
simulatedSmtpLog.simulated = 1;

const notSentSmtpLog = new SmtpLog();
notSentSmtpLog.id = 3;
notSentSmtpLog.body = "Body";
notSentSmtpLog.rcptEmail = "example@mail.com";
notSentSmtpLog.subject = "Betreff";
notSentSmtpLog.sent = 0;
notSentSmtpLog.simulated = 0;

export { sentSmtpLog, simulatedSmtpLog, notSentSmtpLog };
