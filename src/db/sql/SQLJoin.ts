import { SQLElement } from "./SQLElement";
import { JoinType } from "./JoinType";
import { SQLBlock } from "./SQLBlock";
import { SQLParam } from "./SQLParam";
import { SQLElementType } from "./SQLElementType";

/**
 * represents the join part of a sql query
 */
export class SQLJoin extends SQLElement {
  private readonly _joinTableName: string;
  private readonly _joinTableAlias: string;

  private _condition: SQLBlock;
  private _joinType: JoinType = JoinType.JOIN;

  /**
   * @param joinTableName
   * @param joinTableAlias
   * @param condition
   * @param joinType
   */
  public constructor(joinTableName: string, joinTableAlias: string, condition: SQLBlock, joinType: JoinType) {
    super();
    this._joinTableName = joinTableName;
    this._joinTableAlias = joinTableAlias;
    this._condition = condition;
    this._joinType = joinType;
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

  get condition(): SQLBlock {
    return this._condition;
  }

  set condition(value: SQLBlock) {
    this._condition = value;
  }

  /**
   * creates a new condition
   * @param condition
   */
  public setCondition(condition: string): void {
    this._condition = new SQLBlock();
    this._condition.addText(condition);
  }

  get joinType(): JoinType {
    return this._joinType;
  }

  set joinType(value: JoinType) {
    this._joinType = value;
  }
}
