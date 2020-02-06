import { SQLAttribute } from "./SQLAttribute";
import { SQLValueAttribute } from "./SQLValueAttribute";

/**
 * Class that represents a collection of sql-attributes.
 */
export class SQLAttributeCollection<AttributeType extends SQLAttribute> {

    protected _attributes: AttributeType[] = [];

    /**
     * Adds an attribute to the collection.
     *
     * @param attribute attribute that should be added to the collection
     */
    public addAttribute(attribute: AttributeType): void {
        if (attribute instanceof SQLValueAttribute && attribute.value === undefined) {
            return;
        }

        this._attributes.push(attribute);
    }

    /**
     * Returns all attributes of this collection separated by comma.
     *
     * e.g.: id, name, ..
     */
    public getCommaSeparatedNamesUnaliased(): string {
        let returnSQL = "";

        for (const currAttribute of this._attributes) {
            returnSQL += currAttribute.getPrefixedName(false) + ", ";
        }

        if (returnSQL.length > 0) {
            returnSQL = returnSQL.substring(0, returnSQL.length - 2);
        }

        return returnSQL;
    }

    /**
     * Returns all attributes of this collection with the aliased name separated by comma.
     *
     * e.g.: id as idu, name as nameu
     */
    public getCommaSeparatedNames(): string {
        let returnSQL = "";

        for (const currAttribute of this._attributes) {
            returnSQL += currAttribute.getPrefixedName(false) + " AS " + currAttribute.getAliasName() + ", ";
        }

        if (returnSQL.length > 0) {
            returnSQL = returnSQL.substring(0, returnSQL.length - 2);
        }

        return returnSQL;
    }

}
