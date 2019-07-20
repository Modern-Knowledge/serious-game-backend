import { SQLElement } from "./SQLElement";
import { JoinType } from "./JoinType";
import { SQLBlock } from "./SQLBlock";
import { SQLParam } from "./SQLParam";
import { SQLElementType } from "./SQLElementType";

export class SQLJoin extends SQLElement {
  private readonly _joinTableName: string;
  private readonly _joinTableAlias: string;

  private _condition: SQLBlock;
  private _joinType: JoinType = JoinType.JOIN;

  constructor(joinTableName: string, joinTableAlias: string, condition: SQLBlock, joinType: JoinType) {
    super();
    this._joinTableName = joinTableName;
    this._joinTableAlias = joinTableAlias;
    this._condition = condition;
    this._joinType = joinType;
  }

  public getParameters(): SQLParam[] {
    const returnParams: SQLParam[] = [];

    returnParams.concat(this._parameters);
    returnParams.concat(this._condition.getParameters());

    return returnParams;
  }

  get condition(): SQLBlock {
    return this._condition;
  }

  set condition(value: SQLBlock) {
    this._condition = value;
  }

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

  public getElementType(): number {
    return SQLElementType.SQLJoin;
  }

 public getSQL(): string {
    const keyword: string = this.joinType;
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
}
