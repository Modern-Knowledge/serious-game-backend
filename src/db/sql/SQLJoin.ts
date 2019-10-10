import { SQLElement } from "./SQLElement";
import { JoinType } from "./enums/JoinType";
import { SQLBlock } from "./SQLBlock";
import { SQLParam } from "./SQLParam";
import { SQLElementType } from "./enums/SQLElementType";
import { JoinCardinality } from "./enums/JoinCardinality";

/**
 * represents the join part of a sql query
 */
export class SQLJoin extends SQLElement {
  private readonly _joinTableName: string;
  private readonly _joinTableAlias: string;

  private _condition: SQLBlock;
  private readonly _joinType: JoinType = JoinType.JOIN;
  private readonly _joinCardinality: JoinCardinality = JoinCardinality.ONE_TO_ONE;

  /**
   * @param joinTableName
   * @param joinTableAlias
   * @param condition
   * @param joinType
   * @param joinCardinality
   */
  public constructor(joinTableName: string, joinTableAlias: string, condition: SQLBlock, joinType: JoinType, joinCardinality?: JoinCardinality) {
    super();
    this._joinTableName = joinTableName;
    this._joinTableAlias = joinTableAlias;
    this._condition = condition;
    this._joinType = joinType;
    this._joinCardinality = joinCardinality;
  }

  /**
   * returns the parameters for the join
   */
  public getParameters(): SQLParam[] {
    let returnParams: SQLParam[] = [];

    returnParams = returnParams.concat(this._parameters);
    returnParams = returnParams.concat(this._condition.getParameters());

    return returnParams;
  }

  /**
   * returns the element type for the join
   */
  public getElementType(): number {
    return SQLElementType.SQLJoin;
  }

  /**
   * returns the sql for the join part of the sql
   */
  public getSQL(): string {
    const keyword: string = this._joinType;
    let returnSQL: string = "";

   if (this._joinTableName !== undefined && (!(this._joinTableName.length === 0))) {
     returnSQL += keyword + " " + this._joinTableName + " ";
   }

   if (this._joinTableAlias !== undefined && (!(this._joinTableAlias.length === 0))) {
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
