/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 * https://nodemailer.com/message/attachments/
 */

import * as Stream from "stream";

export class Attachment {
    private filename: string;
    private content: string | Buffer | Stream;
    private path: string;
    private href: string;
    private contentType: string;
    private cid: string;

}
