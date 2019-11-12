/**
 * represents a sql parameter with a name and a value
 * e.g.: name = value
 */
export class SQLParam {
    private readonly _name: string;
    private readonly _value: any;
    private _percQuotes = false;

    /**
     * @param name name of the sql-param
     * @param value value of the sql-param
     * @param percQuotes should the value the encapsulated in percent quotes
     */
    public constructor(name: string, value: any, percQuotes: boolean) {
        this._name = name;
        this._value = value;
        this._percQuotes = percQuotes;
    }

    get name(): string {
        return this._name;
    }

    get value(): any {
        return this._value;
    }

}
