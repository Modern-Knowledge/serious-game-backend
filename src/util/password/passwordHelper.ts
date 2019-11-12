
import moment from "moment";
import { User } from "../../lib/models/User";

/**
 * generates and sets the password reset token for the passed user
 * passwordResetToken is  digits long
 * resetToken is valid 7 days from now
 * @param user user where the reset token should be set
 */
export function setPasswordResetToken(user: User): void {
    user.resetcode = generatePasswordResetToken(8);
    user.resetcodeValidUntil = moment().add(1, "days").toDate();
}

/**
 * generates a password reset token with the specified length
 * @param length length of the password token
 */
export function generatePasswordResetToken(length: number = 8): number {
    const timestamp: number = new Date().getTime();
    const str = "" + timestamp;
    return Number(str.substr(0, 8));
}
