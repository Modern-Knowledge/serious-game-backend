/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import { HttpResponse, HttpResponseStatus, HttpResponseMessage, HttpResponseMessageSeverity } from "../lib/utils/http/HttpResponse";
import { HelptextFacade } from "../db/entity/helptext/HelptextFacade";

const router = express.Router();

const controllerName = "HelptextController";

/**
 * GET
 * Get all helptexts.
 */
router.get("/", async (req: Request, res: Response) => {
  const helptextFacade = new HelptextFacade();
  const helptexts = await helptextFacade.get();
  if (!helptexts.length) {
    res.json(new HttpResponse(HttpResponseStatus.FAIL,
      undefined,
      [
          new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Es konnten keine Hilfetexte gefunden werden.`)
      ]
    ));
  }
  return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
    helptexts,
    [
        new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS)
    ]
  ));
});

/**
 * GET
 * Get a helptext by id.
 */
router.get("/:id", async (req: Request, res: Response) => {
  const helptextFacade = new HelptextFacade();
  const helptext = await helptextFacade.getById(Number(req.params.id));
  if (!helptext) {
    res.json(new HttpResponse(HttpResponseStatus.FAIL,
      undefined,
      [
          new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Der Hilfetext konnte nicht gefunden werden.`)
      ]
    ));
  }
  return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
    helptext,
    [
        new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Der Hilfetext wurde erfolgreich gefunden.`)
    ]
  ));
});

export default router;
