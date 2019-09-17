import { UserFacade } from "./UserFacade";
import { Therapist } from "../../../lib/models/Therapist";
import { User } from "../../../lib/models/User";
import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { FilterAttribute } from "../../filter/FilterAttribute";
import { SQLComparisonOperator } from "../../sql/SQLComparisonOperator";
import { SQLJoin } from "../../sql/SQLJoin";
import { JoinType } from "../../sql/JoinType";
import { SQLBlock } from "../../sql/SQLBlock";
import { Filter } from "../../filter/Filter";

/**
 *
 * handles CRUD operations with the therapist-entity
 */
export class TherapistFacade extends EntityFacade<Therapist> {

  private _userFacade: UserFacade;

  public constructor(tableAlias?: string) {
    if (tableAlias) {
      super("therapists", tableAlias);
    } else {
      super("therapists", "t");
    }

    this._userFacade = new UserFacade("ut");
  }

  /**
   * returns SQL-attributes for the therapist
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] = ["therapist_id"];

    const userAttributes: SQLAttributes = this._userFacade.getSQLAttributes(excludedSQLAttributes);
    const therapistAttributes: SQLAttributes = new SQLAttributes(this.tableAlias, sqlAttributes);
    therapistAttributes.addSqlAttributes(userAttributes);

    return therapistAttributes;
  }

  /**
   * returns therapists that match the specified filter
   * @param excludedSQLAttributes
   */
  public getTherapists(excludedSQLAttributes?: string[]): Promise<Therapist[]> {
    const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
    return this.select(attributes, this.getJoins());
  }

  /**
   * inserts a new therapist and returns the created therapist
   * @param therapist
   */
  public async insertTherapist(therapist: Therapist): Promise<Therapist> {
    const t: User = await this._userFacade.insertUser(therapist);

    const attributes: SQLValueAttributes = new SQLValueAttributes();

    const therapistIdAttribute: SQLValueAttribute = new SQLValueAttribute("therapist_id", this.tableName, t.id);
    attributes.addAttribute(therapistIdAttribute);

    return new Promise<Therapist>((resolve, reject) => {
      this.insert(attributes).then(id => {
          if (id > 0) {
            therapist.id = t.id;
            therapist.createdAt = t.createdAt;
            resolve(therapist);
          }
      });
    });
  }

  /**
   * updates the given therapist in the database and returns the number of affected rows
   * @param therapist
   */
  public async updateTherapist(therapist: Therapist): Promise<number> {
    return await this._userFacade.updateUser(therapist);
  }

  /**
   * deletes the specified therapist in the database and returns the number of affected rows
   * @param therapist
   */
  public async deleteTherapist(therapist: Therapist): Promise<number> {
    this._filter.addFilterAttribute(new FilterAttribute("therapist_id", therapist.id, SQLComparisonOperator.EQUAL));
    const rows: number = await this.delete();

    const userRows: number = await this._userFacade.deleteUser(therapist);

    return rows + userRows;
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  public fillEntity(result: any): Therapist {
    const t: Therapist = new Therapist();
    this._userFacade.fillUserEntity(result, t);

    return t;
  }

  /**
   * creates the joins for the therapist-entity and returns them as a list
   */
  public getJoins(): SQLJoin[] {
    const joins: SQLJoin[] = [];

    const userJoin: SQLBlock = new SQLBlock();
    userJoin.addText(`${this.tableAlias}.therapist_id = ${this._userFacade.tableAlias}.id`);
    joins.push(new SQLJoin(this._userFacade.tableName, this._userFacade.tableAlias, userJoin, JoinType.JOIN));

    return joins;
  }

  /**
   * returns the userFacadeFilter
   */
  public getUserFacadeFilter(): Filter {
    return this._userFacade.getFacadeFilter();
  }

}
