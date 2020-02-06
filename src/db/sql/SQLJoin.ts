import { JoinCardinality } from "./enums/JoinCardinality";
import { JoinType } from "./enums/JoinType";
import { SQLElementType } from "./enums/SQLElementType";
import { SQLBlock } from "./SQLBlock";
import { SQLElement } from "./SQLElement";
import { SQLParam } from "./SQLParam";

/**
 * Class that represents the join-part of a sql-query.
 */
export class SQLJoin extends SQLElement {
    private readonly _joinTableName: string;
    private readonly _joinTableAlias: string;

    private readonly _condition: SQLBlock;
    private readonly _joinType: JoinType = JoinType.JOIN;
    private readonly _joinCardinality: JoinCardinality = JoinCardinality.ONE_TO_ONE;

    /**
     * @param joinTableName table-name of the joined table
     * @param joinTableAlias table-alias of the joined table
     * @param condition condition for the join
     * @param joinType type of the join (left, right, ...)
     * @param joinCardinality cardinality of the join (1:1, 1:n, ...)
     */
    public constructor(
        joinTableName: string, joinTableAlias: string, condition: SQLBlock,
        joinType: JoinType, joinCardinality?: JoinCardinality) {

        super();
        this._joinTableName = joinTableName;
        this._joinTableAlias = joinTableAlias;
        this._condition = condition;
        this._joinType = joinType;
        this._joinCardinality = joinCardinality;
    }

    /**
     * Returns the parameters for the join.
     */
    public getParameters(): SQLParam[] {
        let returnParams: SQLParam[] = [];

        returnParams = returnParams.concat(this._parameters);
        returnParams = returnParams.concat(this._condition.getParameters());

        return returnParams;
    }

    /**
     * Returns the element-type.
     */
    public getElementType(): number {
        return SQLElementType.SQLJoin;
    }

    /**
     * Returns the sql for the join part of the sql.
     */
    public getSQL(): string {
        const keyword: string = this._joinType;
        let returnSQL = "";

        if (this._joinTableName !== undefined && (this._joinTableName.length !== 0)) {
            returnSQL += keyword + " " + this._joinTableName + " ";
        }

        if (this._joinTableAlias !== undefined && (this._joinTableAlias.length !== 0)) {
            returnSQL += this._joinTableAlias + " ";
        }

        if (this._condition !== undefined) {
            returnSQL += "ON " + this._condition.getSQL() + " ";
        }

        return returnSQL;
    }

    get joinType(): JoinType {
        return this._joinType;
    }

    get joinCardinality(): JoinCardinality {
        return this._joinCardinality;
    }

}
