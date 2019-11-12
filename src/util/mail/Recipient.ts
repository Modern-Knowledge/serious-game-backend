/*
 * https://nodemailer.com/message/addresses/
 */
export class Recipient {

    public readonly name: string;
    public readonly address: string;

    /**
     * @param name name of the recipient
     * @param address email of the recipient
     */
    constructor(name: string, address: string) {
        this.name = name;
        this.address = address;
    }

}
