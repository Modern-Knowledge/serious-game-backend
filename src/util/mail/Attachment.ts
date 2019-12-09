import * as Stream from "stream";

/**
 * Attachment that can be appended to the mail.
 */
export class Attachment {
    public filename: string;
    public content: string | Buffer | Stream;
    public path: string;
    public href: string;
    public contentType: string;
    public cid: string;
}
