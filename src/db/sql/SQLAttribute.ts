/**
 * Class that represents a sql-attribute with the table-alias and name.
 *
 * e.g.: tableAlias.name
 */
export class SQLAttribute {
    private readonly _tableAlias: string;
    private readonly _name: string;

    /**
     * @param name name of the attribute
     * @param tableAlias table-alias of the attribute
     */
    public constructor(name: string, tableAlias?: string) {
        if (tableAlias) {
            this._tableAlias = tableAlias;
        }

        this._name = name;
    }

    /**
     * Return name prefixed with table-alias and separated by a dot.
     *
     * @param withHighComas should the value of the attribute be encapsulated in quotes
     */
    public getPrefixedName(withHighComas: boolean): string {
        let retStr = "";

        if (this._tableAlias !== undefined && (this._tableAlias.length > 0)) {
            retStr += this._tableAlias + ".";
        }

        if (this._name !== undefined && (this._name.length > 0)) {
            if (withHighComas) {
                retStr += "`" + this._name + "`";
            } else {
                retStr += this._name;
            }
        }

        return retStr;
    }

    /**
     * Returns the aliased name.
     *
     * e.g.: name + tableAlias
     */
    public getAliasName(): string {
        return this._name + this._tableAlias;
    }

    get name(): string {
        return this._name;
    }
}
