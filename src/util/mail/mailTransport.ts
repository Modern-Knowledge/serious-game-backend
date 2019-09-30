/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { Mail } from "./Mail";
import logger from "../log/logger";
import { SmtpLog } from "../../lib/models/SmtpLog";

import * as nodemailer from "nodemailer";
import { SmtpLogFacade } from "../../db/entity/log/SmtpLogFacade";
import { loggerString } from "../Helper";

/**
 * class used to handle mail sending with nodemailer
 */
class MailTransport {
    private _transporter: any;

    private _configVariables = {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE === "1",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },
        logger: false,
        pool: true,
        maxConnections: 5
    };

    public constructor() {
        logger.info(`${loggerString(__dirname, MailTransport.name, "constructor")} MailTransport instance was created!`);

        if (process.env.SEND_MAILS === "1") {
            this._transporter = nodemailer.createTransport(this._configVariables);
        } else {
            logger.warn(`${loggerString(__dirname, MailTransport.name, "constructor")} Mail sending is simulated!`);
        }
    }

    /**
     * sends the provided mail
     * @param mail
     */
    public sendMail(mail: Mail): void {
        if (!mail.validate()) {
            const errStr: string = `${loggerString(__dirname, MailTransport.name, "sendMail")} Mail ist not valid! ${JSON.stringify(mail)}`;
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

        if (process.env.SEND_MAILS === "1") {
            this._transporter.sendMail(mail).then((value: any) => {
                logger.info(`${loggerString(__dirname, MailTransport.name, "sendMail")} Mail sent: ${value.messageId}!`);

                for (const item of smtpLogs) {
                    item.sent = 1;
                    smtpLogFacade.insertLog(item);
                }

            }).catch((error: any) => {
                logger.error(`${loggerString(__dirname, MailTransport.name, "sendMail")} Mail couldn't be sent \n ${error}!`);

                for (const item of smtpLogs) {
                    smtpLogFacade.insertLog(item);
                }

            });
        } else { // mail is simulated
            logger.info(`${loggerString(__dirname, MailTransport.name, "sendMail")} Simulated mail was successfully sent!`);

            for (const item of smtpLogs) {
                smtpLogFacade.insertLog(item);
            }
        }
    }
}

const mailTransport: MailTransport = new MailTransport();
export { mailTransport };