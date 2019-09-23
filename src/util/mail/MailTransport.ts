/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { Mail } from "./Mail";
import logger from "../logger";
import { SmtpLog } from "../../lib/models/SmtpLog";

import * as nodemailer from "nodemailer";
import { SmtpLogFacade } from "../../db/entity/log/SmtpLogFacade";
import { loggerString } from "../Helper";

/**
 * class used to handle mail sending with nodemailer
 */
export class MailTransport {
    private static _instance: MailTransport;

    private _sendMails: boolean;
    private _transporter: any;

    private _configVariables = {
        pool: true,
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE === "1",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },
        logger: false,
    };

    /**
     * @param sendMails determines if mail is sent or simulated
     */
    private constructor(sendMails: boolean) {
        this._sendMails = sendMails;

        if (!this._sendMails) {
            logger.warn(`${loggerString(__dirname, MailTransport.name, "constructor")} Mail sending is simulated!`);
        }
    }

    /**
     * creates the connection to the mail host
     */
    private createNodeMailer(): void {
        if (this._sendMails) {
            this._transporter = nodemailer.createTransport(this._configVariables);
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

        this.createNodeMailer();

        const smtpLogs: SmtpLog[] = [];

        // generate smtp logs
        for (const item of mail.to) {
            const smtpLog: SmtpLog = new SmtpLog();
            smtpLog.subject = mail.subject;
            smtpLog.body = mail.html;
            smtpLog.rcptEmail = item.address;
            smtpLog.simulated = this._sendMails ? 1 : 0;
            smtpLog.sent = 0;

            smtpLogs.push(smtpLog);
        }

        const smtpLogFacade: SmtpLogFacade = new SmtpLogFacade();

        if (this._sendMails) {
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

            // todo maybe refactor to batch insert
            for (const item of smtpLogs) {
                smtpLogFacade.insertLog(item);
            }
        }
    }

    /**
     * returns instance of mail transporter
     */
    public static getInstance(): MailTransport {
        if (!MailTransport._instance) {
            MailTransport._instance = new MailTransport((process.env.SEND_MAILS === "1") || false);
        }

        return this._instance;
    }

}
