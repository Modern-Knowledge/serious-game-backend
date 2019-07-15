import { Request, Response } from "express";
import logger from "../util/logger";

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  console.log(req.params);
  res.send("hello");
  logger.info("Sdasdasdasd");
};
