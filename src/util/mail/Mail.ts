/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 * https://nodemailer.com/message/
 */

import { Attachment } from "./Attachment";
import { Recipient } from "./Recipient";
import { MailPriority } from "./MailPriority";

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
    private replyTo: string;

    /* header options */
    private priority: MailPriority = MailPriority.NORMAL;
    private headers: any;


    /**
     * Common parameters that every Mail needs
     * @param to
     * @param subject
     * @param text
     * @param html
     */
    public constructor(to: Recipient[], subject: string, text: string, html: string) {
        this.to = to;
        this.subject = subject;
        this.text = text;
        this.html = html;
    }

    /**
     * validate mail
     * check that required attributes are set
     */
    public validate(): boolean {
        if (this.to.length === 0) {
            return false;
        }

        if (this.subject.length === 0) {
            return false;
        }

        if (this.text.length === 0) {
            return false;
        }

        return this.html.length !== 0;
    }
}

