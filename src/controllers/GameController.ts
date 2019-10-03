import express from "express";
import { Request, Response } from "express";
import { GameCompositeFacade } from "../db/composite/GameCompositeFacade";
import { HttpResponse, HttpResponseStatus, HttpResponseMessageSeverity, HttpResponseMessage } from "../lib/utils/http/HttpResponse";

const router = express.Router();

/**
 * GET
 * Get all games.
 */
router.get("/", async (req: Request, res: Response) => {
  const gameFacade = new GameCompositeFacade();
  const games = await gameFacade.get();
  if (!games.length) {
    res.json(new HttpResponse(HttpResponseStatus.FAIL,
      undefined,
      [
          new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Es konnten keine Spiele gefunden werden.`)
      ]
    ));
  }
  return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
    games,
    [
        new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS)
    ]
  ));
});

/**
 * GET
 * Get a game by id.
 */
router.get("/:id", async (req: Request, res: Response) => {
  const gameFacade = new GameCompositeFacade();
  const game = await gameFacade.getById(Number(req.params.id));
  if (!game) {
    res.json(new HttpResponse(HttpResponseStatus.FAIL,
      undefined,
      [
          new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Das Spiel konnte nicht gefunden werden.`)
      ]
    ));
  }
  return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
    game,
    [
        new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Das Spiel wurde erfolgreich gefunden.`)
    ]
  ));
});

export default router;
