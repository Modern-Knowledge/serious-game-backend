/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { Mail } from "./Mail";
import logger from "../logger";
import { Helper } from "../Helper";
import { Recipient } from "./Recipient";
import { SmtpLog } from "../../lib/models/SmtpLog";

import * as nodemailer from "nodemailer";
import { SmtpLogFacade } from "../../db/entity/log/SmtpLogFacade";

/**
 * class used to handle mail sending with nodemailer
 */
export class MailTransport {
    private static _instance: MailTransport;

    private _sendMails: boolean;
    private _transporter: any;
    private _connected: boolean = false;

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
     * @param sendMails
     */
    private constructor(sendMails: boolean) {
        this._sendMails = sendMails;
        this._transporter = nodemailer.createTransport(this._configVariables);

        if (!this._sendMails) {
            logger.warn(`${Helper.loggerString(__dirname, MailTransport.name, "constructor")} Mail sending is simulated!`);
        }
    }

    /**
     * creates the connection to the mail host
     */
    private async createNodeMailer(): Promise<void> {
        if (this._sendMails) {
            if (!this._connected) { // reconnect to host
                this._transporter = nodemailer.createTransport(this._configVariables);
            }

            const ptr = this;
            try {
                await this._transporter.verify();
                logger.info(`${Helper.loggerString(__dirname, MailTransport.name, "createNodeMailer")} Connection to mail transport was successfully established!`);
                ptr._connected = true;
            } catch (e) {
                logger.error(`${Helper.loggerString(__dirname, MailTransport.name, "createNodeMailer")} Connection to mail host is not possible! \n ${e}`);
                ptr._connected = false;
            }
        }
    }

    /**
     * sends the provided mail
     * @param mail
     */
    public async sendMail(mail: Mail): Promise<void> {
        if (mail.validate()) {
            logger.warn(`${Helper.loggerString(__dirname, MailTransport.name, "sendMail")} Mail ist not valid! ${JSON.stringify(mail)}`);
        }

        await this.createNodeMailer();

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

        if (this._sendMails && this._connected) {
            this._transporter.sendMail(mail).then((value: any) => {
                logger.info(`${Helper.loggerString(__dirname, MailTransport.name, "sendMail")} Mail sent: ${value.messageId}!`);

                for (const item of smtpLogs) {
                    item.sent = 1;
                    smtpLogFacade.insertLog(item);
                }

            }).catch((error: any) => {
                logger.error(`${Helper.loggerString(__dirname, MailTransport.name, "sendMail")} Mail couldn't be sent \n ${error}!`);

                for (const item of smtpLogs) {
                    smtpLogFacade.insertLog(item);
                }

            });
        } else { // mail is simulated or connection can't be established
            logger.info(`${Helper.loggerString(__dirname, MailTransport.name, "sendMail")} Simulated mail was successfully sent!`);

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
