/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 * https://nodemailer.com/message/
 */

import { Attachment } from "./Attachment";
import { Recipient } from "./Recipient";
import { MailPriority } from "./MailPriority";
import { MailTemplateParser } from "./MailTemplateParser";
import { SmtpMessage } from "../../mail-texts/SmtpMessage";

/**
 * represents a Mail for nodemailer
 */
export class Mail {
    public from: string = process.env.MAIL_USER;
    public to: Recipient[] = [];
    public cc: Recipient[] = [];
    public bcc: Recipient[] = [];
    public subject: string;
    public text: string;
    public html: string;
    public attachments: Attachment[] = [];

    /* Advanced fields */
    public replyTo: string;

    /* header options */
    public priority: MailPriority = MailPriority.NORMAL;
    public headers: any;


    /**
     * Common parameters that every Mail needs
     * @param to
     * @param messageTemplate messageTemplate for the mail
     * @param replacementParams params to replace placeholder variables with
     */
    public constructor(to: Recipient[], messageTemplate: SmtpMessage, replacementParams: string[]) {
        const parser = new MailTemplateParser(replacementParams);

        this.to = to;
        this.subject = messageTemplate.subject;
        this.text = parser.parse(messageTemplate.text);
        this.html = parser.parse(messageTemplate.html);
    }

    /**
     * validate mail
     * check that required attributes are set (recipients, subject, text, html)
     */
    public validate(): boolean {
        return !(this.to.length === 0 || this.subject.length === 0 || this.text.length === 0 || this.html.length === 0);
    }
}

