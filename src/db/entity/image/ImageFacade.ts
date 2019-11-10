import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { Image } from "../../../lib/models/Image";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";

/**
 * handles CRUD operations with the image-entity
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
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["image"];

        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * inserts a new word and returns the created word
     * @param image image to insert
     */
    public async insertImage(image: Image): Promise<Image> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(image);
        const result = await this.insert(attributes);

        if (result.length > 0) {
            image.id = result[0].insertedId;
        }

        return image;
    }


    /**
     * fills the entity
     * @param result result for filling
     */
    protected fillEntity(result: any): Image {
        if (!result[this.name("id")]) {
            return undefined;
        }

        const i: Image = new Image();

        this.fillDefaultAttributes(result, i);

        if (result[this.name("image")]) {
            i.image = result[this.name("image")];
        }


        return i;
    }

    /**
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
     * @param image entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, image: Image): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const nameAttribute: SQLValueAttribute = new SQLValueAttribute("image", prefix, image.image);
        attributes.addAttribute(nameAttribute);

        return attributes;
    }

}
