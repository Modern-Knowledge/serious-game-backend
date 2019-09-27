import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { Image } from "../../../lib/models/Image";

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

}
