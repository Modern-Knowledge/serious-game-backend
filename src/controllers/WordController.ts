import express from "express";
import { Request, Response } from "express";
import { WordFacade } from "../db/entity/word/WordFacade";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const wordFacade = new WordFacade();
  const words = await wordFacade.get();
  res.jsonp(words);
});
router.get("/:id", async (req: Request, res: Response) => {
  const wordFacade = new WordFacade();
  const word = await wordFacade.getById(req.params.id);
  res.jsonp(word);
});

export default router;
