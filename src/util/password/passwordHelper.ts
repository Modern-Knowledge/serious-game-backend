/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */


import { User } from "../../lib/models/User";
import moment from "moment";


/**
 * sets the password reset token for the passed user
 * passwordResetToken is 8 digits long
 * resetToken is valid 7 days from now
 * @param user
 */
export function setPasswordResetToken(user: User): void {
    user.resetcode = generatePasswordResetToken(8);
    user.resetcodeValidUntil = moment().add(7, "days").toDate();
}

/**
 * generates a password reset token with the specified length
 * @param length length of the password token
 */
export function generatePasswordResetToken(length: number = 8): number {
    const timestamp: number = new Date().getTime();
    return timestamp % (10 ** length);
}