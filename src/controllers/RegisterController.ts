import express from "express";
import { Request, Response } from "express";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  res.jsonp("RegisterController");
});
router.post("/", async (req: Request, res: Response) => {
  res.jsonp("RegisterController");
});

export default router;
