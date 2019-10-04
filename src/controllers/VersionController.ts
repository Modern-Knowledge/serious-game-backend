/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";

const router = express.Router();

const controllerName = "VersionController";

router.get("/", (req: Request, res: Response) => {
  res.jsonp(process.env.VERSION);
});

export default router;
