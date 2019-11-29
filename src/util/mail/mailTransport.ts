
import { SmtpLog } from "../../lib/models/SmtpLog";
import logger from "../log/logger";
import { Mail } from "./Mail";

import * as nodemailer from "nodemailer";
import { SmtpLogFacade } from "../../db/entity/log/SmtpLogFacade";
import { inTestMode, loggerString } from "../Helper";

/**
 * class used to handle mail sending with nodemailer
 */
class MailTransport {
    private _transporter: any;

    private _configVariables = {
        auth: {
            pass: process.env.MAIL_PASS,
            user: process.env.MAIL_USER
        },
        host: process.env.MAIL_HOST,
        logger: false,
        maxConnections: 5,
        pool: true,
        port: Number(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE === "1",
    };

    public constructor() {
        logger.info(`${loggerString(__dirname, MailTransport.name, "constructor")} ` +
            `MailTransport instance was created!`);

        if (process.env.SEND_MAILS === "1") {
            this._transporter = nodemailer.createTransport(this._configVariables);
        } else {
            logger.warn(`${loggerString(__dirname, MailTransport.name, "constructor")} ` +
                `Mail sending is simulated!`);
        }
    }

    /**
     * sends the provided mail
     * @param mail mail to send
     */
    public sendMail(mail: Mail): void {
        if (!mail.validate()) {
            const errStr = `${loggerString(__dirname, MailTransport.name, "sendMail")} ` +
                `Mail ist not valid! ${JSON.stringify(mail)}`;
            logger.error(errStr);
            throw new Error(errStr);
        }

        const smtpLogs: SmtpLog[] = [];

        // generate smtp logs
        for (const item of mail.to) {
            const smtpLog: SmtpLog = new SmtpLog();
            smtpLog.subject = mail.subject;
            smtpLog.body = mail.html;
            smtpLog.rcptEmail = item.address;
            smtpLog.simulated = (process.env.SEND_MAILS === "1") ? 0 : 1;
            smtpLog.sent = 0;

            smtpLogs.push(smtpLog);
        }

        const smtpLogFacade: SmtpLogFacade = new SmtpLogFacade();

        if (process.env.SEND_MAILS === "1" && !inTestMode()) { // do not send mails in test mode
            this._transporter.sendMail(mail).then((value: any) => {
                logger.info(`${loggerString(__dirname, MailTransport.name, "sendMail")} ` +
                    `Mail sent: ${value.messageId}!`);

                for (const item of smtpLogs) {
                    item.sent = 1;
                    smtpLogFacade.insertLog(item).catch((dbError: any) => {
                        logger.error(`${loggerString(__dirname, MailTransport.name, "sendMail")} ` +
                            `${dbError.message}!`);
                    });
                }

            }).catch((error: any) => {
                logger.error(`${loggerString(__dirname, MailTransport.name, "sendMail")} ` +
                    `Mail couldn't be sent \n ${error.message}!`);

                for (const item of smtpLogs) {
                    smtpLogFacade.insertLog(item).catch((dbError: any) => {
                        logger.error(`${loggerString(__dirname, MailTransport.name, "sendMail")} ` +
                            `${dbError.message}!`);
                    });
                }

            });
        } else { // mail is simulated
            logger.info(`${loggerString(__dirname, MailTransport.name, "sendMail")} ` +
                `Simulated mail was successfully sent!`);

            for (const item of smtpLogs) {
                smtpLogFacade.insertLog(item).catch((error: any) => {
                    logger.error(`${loggerString(__dirname, MailTransport.name, "sendMail")} ` +
                        `${error.message}!`);
                });
            }
        }
    }
}

const mailTransport: MailTransport = new MailTransport();
export { mailTransport, MailTransport };
