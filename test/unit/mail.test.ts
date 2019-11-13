import { MailTransport, mailTransport } from "../../src/util/mail/mailTransport";
import { Mail } from "../../src/util/mail/Mail";
import { passwordResettet } from "../../src/mail-texts/passwordResettet";
import { Recipient } from "../../src/util/mail/Recipient";
import { SmtpMessage } from "../../src/mail-texts/SmtpMessage";
import { TemplateParser } from "../../src/lib/utils/TemplateParser";

describe("util/mail/mailTransport Tests", () => {

    // SGBUMT01
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

    // SGBUMT02
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

    // SGBUMT03
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

    // SGBUMT04
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

    // SGBUMT05
    it("successfully send message", async () => {
        const currentEnv = process.env;
        process.env = {
            MAIL_HOST: process.env.MAIL_HOST,
            MAIL_PORT: process.env.MAIL_PORT,
            MAIL_SECURE: process.env.MAIL_SECURE,
            MAIL_USER: process.env.MAIL_USER,
            MAIL_PASS: process.env.MAIL_PASS,
            SEND_MAILS: "1"
        };

        const mailTransport = new MailTransport();
        const m = new Mail([new Recipient("Example", "florian.mold@live.at")], passwordResettet, ["Example", "01.01.1970", "support@mail.com"]);
        mailTransport.sendMail(m);

        process.env = currentEnv;
    });
});

describe("util/TemplateParser Tests", () => {

    // SGBUTP01
    it("try to parse mail template that has not replacement variables", async () => {
        const mailTemplateParser = new TemplateParser(["Example", "01.01.1970"]);

        const t = () => {
            mailTemplateParser.parse("Example Text");
        };

        expect(t).toThrow(Error);
    });

    // SGBUTP02
    it("try to parse mail template with not enough replacement variables", async () => {
        const mailTemplateParser = new TemplateParser(["Example", "01.01.1970"]);

        const t = () => {
            mailTemplateParser.parse(passwordResettet.html);
        };

        expect(t).toThrow(Error);
    });

    // SGBUTP03
    it("try to parse mail template with more replacement variables than needed", async () => {
        const mailTemplateParser = new TemplateParser(["Example", "01.01.1970", "support@mail.com", "asdasd"]);
        mailTemplateParser.parse(passwordResettet.html);
    });
});
