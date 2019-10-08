/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { Request } from "express";
import jwt from "express-jwt";

/**
 * retriebes jwt token from header
 * @param req
 */
function getTokenFromHeader(req: Request) {
    if (
        req.headers.authorization && req.headers.authorization.split(" ")[0] === "Token" ||
        req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        return req.headers.authorization.split(" ")[1];
    }

    return undefined;
}

export const auth = {
    required: jwt({
        secret: process.env.SECRET_KEY,
        userProperty: "payload",
        getToken: getTokenFromHeader
    }),
    optional: jwt({
        secret: process.env.SECRET_KEY,
        userProperty: "payload",
        credentialsRequired: false,
        getToken: getTokenFromHeader
    })
};