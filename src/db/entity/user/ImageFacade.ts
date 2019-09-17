import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import Image from "../../../lib/models/Image";

/**
 * handles CRUD operations with images
 */
export class ImageFacade extends EntityFacade<Image> {

  /**
   * @param tableAlias
   */
  public constructor(tableAlias?: string) {

    if (tableAlias) {
      super("images", tableAlias);
    } else {
      super("images", "i");
    }
  }

  /**
   * returns SQL-attributes for the images
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] = ["image"];

    return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
  }

  /**
   * returns images that match the specified filter
   * @param excludedSQLAttributes
   */
  public getImages(excludedSQLAttributes?: string[]): Promise<Image[]> {
    const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
    return this.select(attributes, this.getJoins());
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  protected fillEntity(result: any): Image {
    const i: Image = new Image();

    this.fillDefaultAttributes(result, i);

    if (result[this.name("image")] !== undefined) {
      i.image = result[this.name("image")];
    }


    return i;
  }

}
