import { BaseFacade } from "../BaseFacade";
import { AbstractModel } from "../../lib/models/AbstractModel";
import { SQLAttributes } from "../sql/SQLAttributes";
import { FilterAttribute } from "../filter/FilterAttribute";
import { SQLComparisonOperator } from "../sql/SQLComparisonOperator";
import logger from "../../util/logger";
import { Helper } from "../../util/Helper";

/**
 * base facade for entities
 */
export abstract class EntityFacade<EntityType extends AbstractModel> extends BaseFacade<EntityType> {

    /**
     * @param tableName
     * @param tableAlias
     */
    protected constructor(tableName: string, tableAlias: string) {
        super(tableName, tableAlias);
    }

  /**
   * returns the entity by id
   * @param id
   * @param excludedSQLAttributes
   */
    public async getById(id: number, excludedSQLAttributes?: string[]): Promise<EntityType> {
        const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
        const filter = this.filter;
        filter.addFilterCondition("id", id, SQLComparisonOperator.EQUAL);

        const result: EntityType[] = await this.select(attributes, this.joins);

        if (result.length > 0) {
          return result[0];
        }

        const errorMsg: string = `${Helper.loggerString(__dirname, BaseFacade.name, "select")} More than one result returned!`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
    }

    /**
     * returns all entities that match the specified filter
     * @param excludedSQLAttributes
     */
    public async get(excludedSQLAttributes?: string[]): Promise<EntityType[]> {
      const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
      return this.select(attributes, this.joins);
    }
}
