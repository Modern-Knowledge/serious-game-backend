import { CustomValidator } from "express-validator";
import { UserFacade } from "../../../db/entity/user/UserFacade";
import { retrieveValidationMessage } from "../validationMessages";

/**
 * additional email validator
 * checks if email already exists in the db
 * @param email email to check
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
