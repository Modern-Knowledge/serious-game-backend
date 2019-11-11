import { loggerString } from "./Helper";
import logger from "./log/logger";

/**
 * replace placeholder variables in texts
 */
export class TemplateParser {
    private readonly _params: string[] = [];

    /**
     * @param params params that should be replaced in the text
     */
    public constructor(params: string[]) {
        this._params = params;
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
            const errorStr = `${loggerString(__dirname, TemplateParser.name, "parse")} No variables to replace!`;
            logger.error(errorStr);
            throw new Error(errorStr);
        }

        if (matched.length < this._params.length) {
            logger.warn(`${loggerString(__dirname, TemplateParser.name, "parse")} Found placeholder variables amount (${matched.length}) does not match passed replacement variables amount (${this._params.length})! Surplus variables are discarded!`);
        } else if (matched.length > this._params.length) {
            const errorStr = `${loggerString(__dirname, TemplateParser.name, "parse")} Not enough replacement variables passed!`;
            logger.error(errorStr);
            throw new Error(errorStr);
        }

        for (let i = 0; i < matched.length; i++) {
            text = text.replace(matched[i], this._params[i]);
        }

        logger.debug(`${loggerString(__dirname, TemplateParser.name, "parse")} Message template parsed!`);

        return text;
    }
}
