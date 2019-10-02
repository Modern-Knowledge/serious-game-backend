/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { CustomValidator } from "express-validator";

export const passwordValidator: CustomValidator = (value: any) => {
    // length: >= 6
    // zahlen: optional
    // sonderzeichen: optional
    return true;
};