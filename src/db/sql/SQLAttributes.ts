import { SQLAttribute } from "./SQLAttribute";
import { SQLAttributeCollection } from "./SQLAttributeCollection";

/**
 * Handles interaction with the class SQLAttributeCollection. Provides
 * functionality to add attributes.
 */
export class SQLAttributes extends SQLAttributeCollection<SQLAttribute> {

    /**
     * @param tableAlias table-alias of the sql attributes
     * @param attributes array of attributes
     */
    public constructor(tableAlias?: string, attributes?: string[]) {
        super();

        if (attributes && tableAlias) {
            for (const currAttr of attributes) {
                this._attributes.push(new SQLAttribute(currAttr, tableAlias));
            }
        }
    }

    /**
     * Adds a collection of sql attributes of the current collection.
     *
     * @param sqlAttributes sql-attributes that should be added
     */
    public addSqlAttributes(sqlAttributes: SQLAttributes): void {
        for (const attr of sqlAttributes._attributes) {
            this._attributes.push(attr);
        }
    }

}
