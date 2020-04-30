import { IUserInterface } from "serious-game-library/dist/interfaces/IUserInterface";
import { User } from "serious-game-library/dist/models/User";
import { loggerString } from "../Helper";
import logger from "../log/logger";

/**
 * Checks if the auth-user is allowed to view/edit the specified resources that are loaded by the endpoint.
 * Checks if the resources belong to the user, by checking the user-id from the resource. Afterwards the id of the
 * auth-user is compared with the id of the resource. If the user is allowed to view all resource, the function returns
 * true. Otherwise false is returned.
 *
 * @param authUser auth-user where the permission should be validated
 * @param resources array of resources that should be checked
 */
export function validatePermission(authUser: User, resources: IUserInterface[]): boolean {
    logger.debug(`${loggerString(__dirname, "permissionGuard", "validatePermission")}`);

    for (const item of resources) { // checks every resource
        if (item && item.getUserId && authUser.id !== item.getUserId()) { // check if user id = resources user id
            logger.debug(`${loggerString(__dirname, "permissionGuard", "validatePermission")} ` +
                `User with id ${authUser.id} is not allowed to view the resources of user with id ${item.getUserId()}`);
            return false;
        }
    }

    return true;
}
