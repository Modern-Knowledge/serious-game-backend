import { Image } from "../../../lib/models/Image";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * Handles CRUD operations with the image-entity.
 */
export class ImageFacade extends EntityFacade<Image> {

    /**
     * @param tableAlias table-alias of the facade
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("images", tableAlias);
        } else {
            super("images", "i");
        }
    }

    /**
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["image"];

        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
    }

    /**
     * Inserts a new image and returns the created image.
     *
     * @param image image to insert
     */
    public async insert(image: Image): Promise<Image> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(image);
        const result = await this.insertStatement(attributes);

        if (result.length > 0) {
            image.id = result[0].insertedId;
        }

        return image;
    }

    /**
     * Fills the image-entity from the result.
     *
     * @param result database results
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
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param image entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, image: Image): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const nameAttribute: SQLValueAttribute = new SQLValueAttribute("image", prefix, image.image);
        attributes.addAttribute(nameAttribute);

        return attributes;
    }

}
