import express, { Request, Response } from "express";
import { check } from "express-validator";

import { ErrortextFacade } from "../db/entity/helptext/ErrortextFacade";
import { ErrortextStatisticFacade } from "../db/entity/helptext/ErrortextStatisticFacade";
import { ErrortextStatistic } from "../lib/models/ErrortextStatistic";
import {
  HttpResponse,
  HttpResponseMessage,
  HttpResponseMessageSeverity,
  HttpResponseStatus,
} from "../lib/utils/http/HttpResponse";
import { failedValidation400Response, http4xxResponse } from "../util/http/httpResponses";
import { logEndpoint } from "../util/log/endpointLogger";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";
import { checkRouteValidation } from "../util/validation/validationHelper";
import { rVM } from "../util/validation/validationMessages";

const router = express.Router();

const controllerName = "ErrortextController";

const authenticationMiddleware = [
  checkAuthenticationToken,
  checkAuthentication
];

/**
 * GET /
 *
 * Get all errortexts.
 *
 * response:
 * - errortexts: all errortexts of the application
 * - token: authentication token
 */
router.get(
  "/",
  authenticationMiddleware,
  async (req: Request, res: Response, next: any) => {
    const errorTextFacade = new ErrortextFacade();

    try {
      const errortexts = await errorTextFacade.get();

      logEndpoint(controllerName, `Return all errortexts!`, req);

      return res
        .status(200)
        .json(
          new HttpResponse(
            HttpResponseStatus.SUCCESS,
            { errortexts, token: res.locals.authorizationToken },
            [
              new HttpResponseMessage(
                HttpResponseMessageSeverity.SUCCESS,
                `Alle Fehlertexte erfolgreich geladen!`
              )
            ]
          )
        );
    } catch (e) {
      return next(e);
    }
  }
);

/**
 * GET /:id
 *
 * Get a errortext by id.
 *
 * params:
 * - id: id of the errortext
 *
 * response:
 * - errortext: loaded errortext
 * - token: authentication token
 */
router.get(
  "/:id",
  authenticationMiddleware,
  [
    check("id")
      .isNumeric()
      .withMessage(rVM("id", "numeric"))
  ],
  async (req: Request, res: Response, next: any) => {
    if (!checkRouteValidation(controllerName, req, res)) {
      return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);
    const errortextFacade = new ErrortextFacade();

    try {
      const errortext = await errortextFacade.getById(id);

      if (!errortext) {
        logEndpoint(controllerName, `Errortext with id ${id} not found!`, req);

        return http4xxResponse(res, [
          new HttpResponseMessage(
            HttpResponseMessageSeverity.DANGER,
            `Der Fehlertext wurde nicht gefunden!`
          )
        ]);
      }

      logEndpoint(
        controllerName,
        `Errortext with id ${id} was successfully loaded!`,
        req
      );

      return res
        .status(200)
        .json(
          new HttpResponse(
            HttpResponseStatus.SUCCESS,
            { errortext, token: res.locals.authorizationToken },
            [
              new HttpResponseMessage(
                HttpResponseMessageSeverity.SUCCESS,
                `Der Fehlertext wurde erfolgreich gefunden!`
              )
            ]
          )
        );
    } catch (e) {
      return next(e);
    }
  }
);

/**
 * POST /
 *
 * Insert an errortext
 *
 *
 * response:
 * - errortext: the created errortext
 * - token: authentication token
 */
router.post(
  "/",
  authenticationMiddleware,
  async (req: Request, res: Response, next: any) => {
    if (!checkRouteValidation(controllerName, req, res)) {
      return failedValidation400Response(req, res);
    }

    const errortextData = req.body;
    const errortextFacade = new ErrortextStatisticFacade();

    try {
      const errorTextStatistic = new ErrortextStatistic();
      errorTextStatistic.errortextId = errortextData.errortext.id;
      errorTextStatistic.statisticId = errortextData.session._statisticId;
      const errortext = await errortextFacade.insertErrortextStatistic(
        errorTextStatistic
      );

      if (!errortext) {
        return http4xxResponse(res, [
          new HttpResponseMessage(
            HttpResponseMessageSeverity.DANGER,
            `Fehler beim erstellen des Fehlertexts!`
          )
        ]);
      }

      logEndpoint(controllerName, `Errortext was successfully created!`, req);

      return res
        .status(200)
        .json(
          new HttpResponse(
            HttpResponseStatus.SUCCESS,
            { errortext, token: res.locals.authorizationToken },
            [
              new HttpResponseMessage(
                HttpResponseMessageSeverity.SUCCESS,
                `Der Fehlertext wurde erfolgreich erstellt!`
              )
            ]
          )
        );
    } catch (e) {
      return next(e);
    }
  }
);

/**
 * POST /bulk
 *
 * Insert multiple errortexts at once
 *
 *
 * response:
 * - errortexts: the created errortexts
 * - token: authentication token
 */
router.post(
  "/bulk",
  authenticationMiddleware,
  async (req: Request, res: Response, next: any) => {
    if (!checkRouteValidation(controllerName, req, res)) {
      return failedValidation400Response(req, res);
    }

    const errortextsData: any[] = req.body.errortexts;
    const errortextFacade = new ErrortextStatisticFacade();

    try {
      const errorTextStatistic = new ErrortextStatistic();
      const errortexts = [];
      for (const errortextData of errortextsData) {
        errorTextStatistic.errortextId = errortextData._id;
        errorTextStatistic.statisticId = req.body.session._statisticId;
        errortexts.push(
          await errortextFacade.insertErrortextStatistic(errorTextStatistic)
        );
      }

      if (!errortexts) {
        return http4xxResponse(res, [
          new HttpResponseMessage(
            HttpResponseMessageSeverity.DANGER,
            `Fehler beim Erstellen der Fehlertexte!`
          )
        ]);
      }

      logEndpoint(controllerName, `Errortexts were successfully created!`, req);

      return res
        .status(200)
        .json(
          new HttpResponse(
            HttpResponseStatus.SUCCESS,
            { errortexts, token: res.locals.authorizationToken },
            [
              new HttpResponseMessage(
                HttpResponseMessageSeverity.SUCCESS,
                `Die Fehlertexte wurden erfolgreich erstellt!`
              )
            ]
          )
        );
    } catch (e) {
      return next(e);
    }
  }
);

export default router;
