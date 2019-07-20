import { Request, Response } from "express";
import logger from "../util/logger";
import { DatabaseConnection } from "../util/DatabaseConnection";

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  // res.send(DatabaseConnection.getInstance().ping());
};
