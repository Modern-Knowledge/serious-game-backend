import { Log } from "../lib/models/Log";
import { validTherapist } from "./users";

const debugLog = new Log();
debugLog.level = "debug";
debugLog.logger = "www";
debugLog.method = "method";
debugLog.message = "message";
debugLog.params = ["param1 param2"];

const infoLogWithUser = new Log();
infoLogWithUser.level = "info";
infoLogWithUser.logger = "www";
infoLogWithUser.method = "method";
infoLogWithUser.message = "message";
infoLogWithUser.params = ["params params"];
infoLogWithUser.userId = 1;

const errorLogWithUser = new Log();
errorLogWithUser.level = "error";
errorLogWithUser.logger = "www";
errorLogWithUser.method = "method";
errorLogWithUser.message = "message";
errorLogWithUser.params = ["params params"];
errorLogWithUser.userId = validTherapist.id;

const verboseLogWithUser = new Log();
verboseLogWithUser.level = "verbose";
verboseLogWithUser.logger = "www";
verboseLogWithUser.method = "method";
verboseLogWithUser.message = "message";
verboseLogWithUser.params = ["params params"];

export {
    debugLog, infoLogWithUser, errorLogWithUser, verboseLogWithUser
};
