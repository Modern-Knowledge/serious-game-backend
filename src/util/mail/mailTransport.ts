
import { SmtpLog } from "serious-game-library/dist/models/SmtpLog";
import logger from "../log/logger";
import { Mail } from "./Mail";

import * as nodemailer from "nodemailer";
import { SmtpLogFacade } from "../../db/entity/log/SmtpLogFacade";
import { inTestMode, loggerString } from "../Helper";

/**
 * handle mail-sending with node-mailer.
 */
class MailTransport {
    private readonly _transporter: any;

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
        tls: {
            rejectUnauthorized: false
        },
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
     * Sends the provided mail via smtp. If the mail is not valid, the function throws an error.
     * Only send mails if the .env variable "SEND_MAILS" is set and the application is not running in test-mode.
     * Inserts a log for every mail that should be sent. Logs show if the mails were really sent through smtp or
     * if it they were just simulated.
     *
     * @param mail mail that should be sent
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

        if (process.env.SEND_MAILS === "1" && !inTestMode()) { // do not send mails in test mode
            this._transporter.sendMail(mail).then((value: any) => {
                logger.info(`${loggerString(__dirname, MailTransport.name, "sendMail")} ` +
                    `Mail sent: ${value.messageId}!`);

                for (const item of smtpLogs) {
                    item.sent = 1;
                    this.insertSmtpLog(item);
                }

            }).catch((error: any) => {
                logger.error(`${loggerString(__dirname, MailTransport.name, "sendMail")} ` +
                    `Mail couldn't be sent \n ${error.message}!`);

                for (const item of smtpLogs) {
                    this.insertSmtpLog(item);
                }

            });
        } else { // mail is simulated
            logger.info(`${loggerString(__dirname, MailTransport.name, "sendMail")} ` +
                `Simulated mail was successfully sent!`);

            for (const item of smtpLogs) {
                this.insertSmtpLog(item);
            }
        }
    }

    /**
     * Inserts the given smtp-log into the database. If an error occurs while creating the log, an error is printed.
     *
     * @param item smtp-log that should be inserted
     */
    private insertSmtpLog(item: SmtpLog): void {
        const smtpLogFacade: SmtpLogFacade = new SmtpLogFacade();

        smtpLogFacade.insert(item).catch((dbError: any) => {
            logger.error(`${loggerString(__dirname, MailTransport.name, "sendMail")} ` +
                `${dbError.message}!`);
        });
    }

    get transporter(): any {
        return this._transporter;
    }
}

const mailTransport: MailTransport = new MailTransport();
export { mailTransport, MailTransport };
