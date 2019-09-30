/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import logger from "../log/logger";
import { loggerString } from "../Helper";

/**
 * replace placeholder variables in mail-message with passed mail params
 */
export class MailTemplateParser {
    private readonly _mailParams: string[] = [];

    /**
     * @param mailParams
     */
    public constructor(mailParams: string[]) {
        this._mailParams = mailParams;
    }

    /**
     * replaces the placeholder variables with real values
     * if variable amount does not match the specified, warnings and errors are printed
     * @param text string that ist processed
     */
    public parse(text: string): string {
        const regexp: RegExp = new RegExp("::(.*?)::", "g");
        const matched: RegExpMatchArray = text.match(regexp);

        if (matched === null) {
            const errorStr: string = `${loggerString(__dirname, MailTemplateParser.name, "parse")} No variables to replace!`;
            logger.error(errorStr);
            throw new Error(errorStr);
        }

        if (matched.length < this._mailParams.length) {
            logger.warn(`${loggerString(__dirname, MailTemplateParser.name, "parse")} Found placeholder variables amount (${matched.length}) does not match passed replacement variables amount (${this._mailParams.length})! Surplus variables are discarded!`);
        } else if (matched.length > this._mailParams.length) {
            const errorStr: string = `${loggerString(__dirname, MailTemplateParser.name, "parse")} Not enough replacement variables passed!`;
            logger.error(errorStr);
            throw new Error(errorStr);
        }

        for (let i = 0; i < matched.length; i++) {
            text = text.replace(matched[i], this._mailParams[i]);
        }

        logger.debug(`${loggerString(__dirname, MailTemplateParser.name, "parse")} Message template parsed!`);

        return text;
    }
}