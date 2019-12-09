
import moment from "moment";
import { User } from "../../lib/models/User";

/**
 * Generates and sets the password reset token for the given user. Token length
 * is set as a .env variable.
 *
 * @param user user where the reset token should be set
 */
export function setPasswordResetToken(user: User): void {
    user.resetcode = generatePasswordResetToken(Number(process.env.PASSWORD_TOKEN_LENGTH));
    user.resetcodeValidUntil = moment().add(1, "days").toDate();
}

/**
 * Generates a password reset token with the specified length. Extracts
 * n digits from the current timestamp.
 *
 * @param length length of the password token
 */
export function generatePasswordResetToken(length: number): number {
    const timestamp: number = new Date().getTime();
    const str = "" + timestamp;
    return Number(str.substr(0, length));
}
