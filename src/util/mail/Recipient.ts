/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 * https://nodemailer.com/message/addresses/
 */
export class Recipient {

    public readonly name: string;
    public readonly address: string;

    /**
     * @param name
     * @param address
     */
    constructor(name: string, address: string) {
        this.name = name;
        this.address = address;
    }

}
