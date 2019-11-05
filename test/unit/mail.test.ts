import { TemplateParser } from "TemplateParser.ts";
import { MailTransport, mailTransport } from "../../src/util/mail/mailTransport";
import { Mail } from "../../src/util/mail/Mail";
import { passwordResettet } from "../../src/mail-texts/passwordResettet";
import { Recipient } from "../../src/util/mail/Recipient";
import { SmtpMessage } from "../../src/mail-texts/SmtpMessage";

describe("util/mail/mailTransport Tests", () => {

    it("try to send mail without recipients", async () => {
        const smtpMessage = new SmtpMessage();
        smtpMessage.subject = "subject";
        smtpMessage.html = "body";
        smtpMessage.text = "text";

        const t = () => {
            const m = new Mail([], smtpMessage, []);
            mailTransport.sendMail(m);
        };

        expect(t).toThrow(Error);
    });

    it("try to send mail without subject", async () => {
        const smtpMessage = new SmtpMessage();
        smtpMessage.html = "body";
        smtpMessage.text = "text";

        const t = () => {
            const m = new Mail([new Recipient("Example", "example@mail.com")], smtpMessage, []);
            mailTransport.sendMail(m);
        };

        expect(t).toThrow(Error);
    });

    it("try to send mail without html body", async () => {
        const smtpMessage = new SmtpMessage();
        smtpMessage.subject = "subject";
        smtpMessage.text = "text";

        const t = () => {
            const m = new Mail([new Recipient("Example", "example@mail.com")], smtpMessage, []);
            mailTransport.sendMail(m);
        };

        expect(t).toThrow(Error);
    });

    it("try to send mail without plain text body", async () => {
        const smtpMessage = new SmtpMessage();
        smtpMessage.subject = "subject";
        smtpMessage.html = "body";

        const t = () => {
            const m = new Mail([new Recipient("Example", "example@mail.com")], smtpMessage, []);
            mailTransport.sendMail(m);
        };

        expect(t).toThrow(Error);
    });

    it("successfully send message", async () => {
        process.env["SEND_MAILS"] = "1";

        const mailTransport = new MailTransport();
        const m = new Mail([new Recipient("Example", "florian.mold@live.at")], passwordResettet, ["Example", "01.01.1970", "support@mail.com"]);
        mailTransport.sendMail(m);

        process.env["SEND_MAILS"] = "0";
    });
});

describe("util/mail/TemplateParser Tests", () => {

    it("try to parse mail template that has not replacement variables", async () => {
        const mailTemplateParser = new TemplateParser(["Example", "01.01.1970"]);

        const t = () => {
            mailTemplateParser.parse("Example Text");
        };

        expect(t).toThrow(Error);
    });

    it("try to parse mail template with not enough replacement variables", async () => {
        const mailTemplateParser = new TemplateParser(["Example", "01.01.1970"]);

        const t = () => {
            mailTemplateParser.parse(passwordResettet.html);
        };

        expect(t).toThrow(Error);
    });

    it("try to parse mail template with more replacement variables than needed", async () => {
        const mailTemplateParser = new TemplateParser(["Example", "01.01.1970", "support@mail.com", "asdasd"]);
        mailTemplateParser.parse(passwordResettet.html);
    });
});