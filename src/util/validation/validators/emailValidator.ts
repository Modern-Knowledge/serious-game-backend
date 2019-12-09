import { CustomValidator } from "express-validator";
import { UserFacade } from "../../../db/entity/user/UserFacade";
import { retrieveValidationMessage } from "../validationMessages";

/**
 * Additional e-mail validator. Checks if the given e-mail has already been taken
 * by another user. If the mail is in the database the method returns false.
 * Otherwise the e-mail can be used by the user.
 *
 * @param email email that should be checked
 */
export const emailValidator: CustomValidator = (email: any) => {
    const userFacade: UserFacade = new UserFacade();
    userFacade.filter.addFilterCondition("email", email);

    return userFacade.getOne().then((user) => {
        if (user) {
            return Promise.reject(retrieveValidationMessage("email", "duplicate"));
        }

        return Promise.resolve(user);
    });
};
