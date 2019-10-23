import { User } from "../../lib/models/User";
import { UserInterface } from "../../lib/interfaces/UserInterface";
import logger from "../log/logger";
import { loggerString, skipPermissionCheck } from "../Helper";

/**
 * functions to check permissions in routes
 */

/**
 * checks if the authUser is allowed to view/edit the specified resources
 * retrieves the user id from the resource and compare it the the auth user
 *
 * @param authUser
 * @param resources
 */
export function validatePermission(authUser: User, resources: UserInterface[]): boolean {
    logger.debug(`${loggerString(__dirname, "permissionGuard", "validatePermission")}`);

    if (skipPermissionCheck()) {
        logger.warn(`${loggerString(__dirname, "permissionGuard", "validatePermission")} Checking the permission to view resources is skipped`);
        return true;
    }

    for (const item of resources) { // checks every resource
        if (item && item.getUserId && authUser.id !== item.getUserId()) { // check if user id is the same as the resources user id
            logger.debug(`${loggerString(__dirname, "permissionGuard", "validatePermission")} User with id ${authUser.id} is not allowed to view the resources of user with id ${item.getUserId()}`);
            return false;
        }
    }

    return true;
}
