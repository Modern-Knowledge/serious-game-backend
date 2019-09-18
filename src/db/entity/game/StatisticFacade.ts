import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { Statistic } from "../../../lib/models/Statistic";

/**
 * handles CRUD operations with the statistic-entity
 */
export class StatisticFacade extends EntityFacade<Statistic> {

  /**
   * @param tableAlias
   */
  public constructor(tableAlias?: string) {
    if (tableAlias) {
      super("statistics", tableAlias);
    } else {
      super("statistics", "st");
    }
  }

  /**
   * returns SQL-attributes for the statistics
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] = ["starttime", "endtime"];

    return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
  }

  /**
   * returns statistics that match the specified filter
   * @param excludedSQLAttributes
   */
  public getStatistics(excludedSQLAttributes?: string[]): Promise<Statistic[]> {
    const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
    return this.select(attributes, this.getJoins());
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  public fillEntity(result: any): Statistic {
    const statistic: Statistic = new Statistic();

    this.fillDefaultAttributes(result, statistic);

    if (result[this.name("starttime")] !== undefined) {
      statistic.startTime = result[this.name("starttime")];
    }

    if (result[this.name("endtime")] !== undefined) {
      statistic.endTime = result[this.name("endtime")];
    }

    return statistic;
  }

}
