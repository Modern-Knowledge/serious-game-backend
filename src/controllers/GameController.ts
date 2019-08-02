import express from "express";
import { Request, Response } from "express";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  res.jsonp("GameController");
});

export default router;
