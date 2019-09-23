/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 * https://nodemailer.com/message/attachments/
 */

import * as Stream from "stream";

export class Attachment {
    public filename: string;
    public content: string | Buffer | Stream;
    public path: string;
    public href: string;
    public contentType: string;
    public cid: string;
}
