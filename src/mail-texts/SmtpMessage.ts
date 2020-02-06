/**
 * Message that can be sent via smtp to multiple recipients.
 * Contains a subject, html-text, plain-text.
 */
export class SmtpMessage {
    private _subject: string;
    private _html: string;
    private _text: string;

    get subject(): string {
        return this._subject;
    }

    set subject(value: string) {
        this._subject = value;
    }

    get html(): string {
        return this._html;
    }

    set html(value: string) {
        this._html = value;
    }

    get text(): string {
        return this._text;
    }

    set text(value: string) {
        this._text = value;
    }
}
