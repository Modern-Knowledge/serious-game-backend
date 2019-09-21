/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import {Mail} from "./Mail";
import logger from "../logger";
import {Helper} from "../Helper";
import {Recipient} from "./Recipient";

const nodemailer = require("nodemailer"); // &todo import syntax

/**
 * class used to handle mail sending with nodemailer
 */
export class MailTransport {
    private static _instance: MailTransport;

    private readonly _sendMails: boolean;

    private _transporter: any;

    private _configVariables = {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE === "1",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },
    };

    /**
     * @param sendMails
     */
    private constructor(sendMails: boolean) {
        this._sendMails = sendMails;

        if (this._sendMails) {
            this.createNodeMailer();
        } else {
            logger.warn(`${Helper.loggerString(__dirname, MailTransport.name, "constructor")} Mail sending is simulated!`);
        }
    }

    /**
     * creates the connection to the mail host
     */
    private createNodeMailer(): void {
        this._transporter = nodemailer.createTransport(this._configVariables);
        logger.info(`${Helper.loggerString(__dirname, MailTransport.name, "createNodeMailer")} Connection to mail transport was successfully established!`);
    }

    /**
     * sends the provided mail
     * @param mail
     */
    public sendMail(mail: Mail): void {
        if (this._sendMails) {
           this._transporter.sendMail(mail).then((value: any) => {
               logger.info(`${Helper.loggerString(__dirname, MailTransport.name, "sendMail")} Mail sent: ${value.messageId}`);
           });
        } else {
            logger.info(`${Helper.loggerString(__dirname, MailTransport.name, "sendMail")} Simulated mail was successfully sent!`);
        }

        // todo insert mail into db
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
