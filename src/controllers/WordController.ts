import express from "express";
import { Request, Response } from "express";
import { WordFacade } from "../db/entity/word/WordFacade";
import { HttpResponse, HttpResponseStatus, HttpResponseMessage, HttpResponseMessageSeverity } from '../lib/utils/http/HttpResponse';

const router = express.Router();

/**
 * GET
 * Get all words.
 */
router.get("/", async (req: Request, res: Response) => {
  const wordFacade = new WordFacade();
  const words = await wordFacade.get();
  if(!words.length){
    res.json(new HttpResponse(HttpResponseStatus.FAIL,
      undefined,
      [
          new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Es konnten keine Wörter gefunden werden.`)
      ]
    ));
  }
  return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
    words,
    [
        new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, null)
    ]
  ));
});

/**
 * GET
 * Get a word by id.
 */
router.get("/:id", async (req: Request, res: Response) => {
  const wordFacade = new WordFacade();
  const word = await wordFacade.getById(req.params.id);
  if(!word){
    res.json(new HttpResponse(HttpResponseStatus.FAIL,
      undefined,
      [
          new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Das Wort konnte nicht gefunden werden.`)
      ]
    ));
  }
  return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
    word,
    [
        new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, null)
    ]
  ));
});

export default router;
