import express, { Request, Response } from "express";
import { ImageFacade } from "../db/entity/image/ImageFacade";
import { Filter } from "../db/filter/Filter";
import { FilterAttribute } from "../db/filter/FilterAttribute";
import { SQLComparisonOperator } from "../db/sql/SQLComparisonOperator";
import Image from "../lib/models/Image";

const router = express.Router();

/**
 * GET /
 * Home page.
 */
router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  const facade: ImageFacade = new ImageFacade();
  const filter: Filter = facade.getFacadeFilter();
  filter.addFilterAttribute(new FilterAttribute("id", id, SQLComparisonOperator.EQUAL));
  const images = await facade.getImages();
  let image: Image;

  if (images.length > 0) {
    image = images[0];
  }

  res.type("image/png");
  res.send(image.image);
});

export default router;
