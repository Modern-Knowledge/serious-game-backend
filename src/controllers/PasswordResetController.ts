/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express, { Request, Response } from "express";

const router = express.Router();

/**
 * POST /
 * reset the password
 */
router.post("/reset/:userid", async (req: Request, res: Response) => {

});

export default router;
