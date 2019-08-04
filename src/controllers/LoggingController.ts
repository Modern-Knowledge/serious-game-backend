import express from "express";
import { Request, Response } from "express";
import { LogFacade } from "../db/entity/log/LogFacade";
import { Log } from "../lib/models/Log";
import { SQLOrder } from "../db/sql/SQLOrder";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const facade: LogFacade = new LogFacade();
  facade.addOrderBy("id", SQLOrder.ASC);

  const logs = await facade.getLogs();
  
  res.type("json");
  res.json(logs);
  res.end();
});

router.post("/create", async (req: Request, res: Response) => {
  const facade: LogFacade = new LogFacade();

  for (const item of req.body) {
    const log: Log = new Log();

    const messages: string[] = item.message;
    const method = messages.shift();
    const message = messages.shift();

    log.logger = item.logger;
    log.level = item.level;
    log.method = method;
    log.message = message;
    log.params = item.message.length === 0 ? [] : item.message;

    await facade.insertLog(log);
  }

  res.end();
});


export default router;
