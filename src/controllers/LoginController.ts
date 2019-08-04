import express from "express";
import { Request, Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send("LoginController");
});

router.get("/logout", (req: Request, res: Response) => {
  res.send("LoginController");
});

router.post("/", (req: Request, res: Response) => {
  res.send("Hello");
});

export default router;
