import { TemplateParser } from "../../lib/utils/TemplateParser";
import { SmtpMessage } from "../../mail-texts/SmtpMessage";
import { Attachment } from "./Attachment";
import { MailPriority } from "./MailPriority";
import { Recipient } from "./Recipient";

/**
 * Represents a Mail that can be sent via node-mailer.
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

    /* Header options */
    public priority: MailPriority = MailPriority.NORMAL;
    public headers: any;

    /**
     * Creates a new mail with the attributes that every mail needs.
     *
     * @param to array of recipients
     * @param messageTemplate message-template for the mail
     * @param replacementParams params to replace placeholder variables in template
     */
    public constructor(to: Recipient[], messageTemplate: SmtpMessage, replacementParams: string[]) {
        const parser = new TemplateParser(replacementParams);

        this.to = to;
        this.replyTo = process.env.SUPPORT_MAIL || this.from;
        this.subject = messageTemplate.subject;
        this.text = parser.parse(messageTemplate.text);
        this.html = parser.parse(messageTemplate.html);
    }

    /**
     * Validates a mail.
     * Check that required attributes are set (recipients, subject, text, html)
     */
    public validate(): boolean {
        return !(this.to.length === 0 || this.subject.length === 0 || this.text.length === 0 || this.html.length === 0);
    }
}
