
import { CustomValidator } from "express-validator";
import { retrieveValidationMessage } from "../validationMessages";

/**
 * Additional passwordValidator. Checks if password matches the password-confirmation
 * in the body. Returns true it is does, otherwise false is returned.
 *
 * @param password password to check
 * @param req request to check against
 */
export const passwordValidator: CustomValidator = (password: any, { req }) => {
    if (!password || !req.body.password_confirmation) {
        return Promise.resolve(true);
    }

    if (password !== req.body.password_confirmation) {
        return Promise.reject(retrieveValidationMessage("password", "not_matching"));
    }

    return Promise.resolve(true);
};
