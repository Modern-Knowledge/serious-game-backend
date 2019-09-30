/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import rfs from "rotating-file-stream";

/**
 * log file rotates daily
 */
export const accessLogStream = rfs("request.log", {
  interval: "1d", // rotate daily
  path: "logs/"
});
