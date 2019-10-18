/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { CustomValidator } from "express-validator";
import { retrieveValidationMessage } from "../validationMessages";

/**
 * additional passwordValidator
 * checks if password matches password-confirmation in body
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
