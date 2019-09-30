import rfs from "rotating-file-stream";

/**
 * log file rotates daily
 */
export const accessLogStream = rfs("request.log", {
  interval: "1d", // rotate daily
  path: "logs/"
});
