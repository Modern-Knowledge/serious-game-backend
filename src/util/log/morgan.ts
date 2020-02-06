
import rfs from "rotating-file-stream";

/**
 * Log files rotate daily.
 */
export const accessLogStream = rfs("request.log", {
  interval: "1d", // rotate daily
  path: "logs/"
});
