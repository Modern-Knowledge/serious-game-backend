import express from "express";
import { Request, Response } from "express";
import { WordFacade } from "../db/entity/word/WordFacade";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  const wordFacade = new WordFacade();
  const words = wordFacade.get();
  res.jsonp(words);
});
router.get("/:id", (req: Request, res: Response) => {
  const wordFacade = new WordFacade();
  const word = wordFacade.getById(req.params.id);
  res.jsonp(word);
});

export default router;
