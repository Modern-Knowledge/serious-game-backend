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
   * returns sql attributes that should be retrieved from the database
   * @param excludedSQLAttributes attributes that should not be selected
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] = ["starttime", "endtime"];

    return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
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
