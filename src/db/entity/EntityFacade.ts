
import { AbstractModel } from "../../lib/models/AbstractModel";
import { loggerString } from "../../util/Helper";
import logger from "../../util/log/logger";
import { BaseFacade } from "../BaseFacade";
import { Filter } from "../filter/Filter";
import { SQLComparisonOperator } from "../sql/enums/SQLComparisonOperator";
import { SQLAttributes } from "../sql/SQLAttributes";

/**
 * base facade for entities
 */
export abstract class EntityFacade<EntityType extends AbstractModel<EntityType>> extends BaseFacade<EntityType> {

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
        this.idFilter.addFilterCondition("id", id, SQLComparisonOperator.EQUAL);
        const result: EntityType[] = await this.select(attributes, this.idFilter);

        this.idFilter.clear();

        return result[0];
    }

    /**
     * returns all entities that match the specified filter
     * @param excludedSQLAttributes
     */
    public async get(excludedSQLAttributes?: string[]): Promise<EntityType[]> {
      const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
      return this.select(attributes, this.filter);
    }

    /**
     * returns the first entity that matches the specified filter
     * @param excludedSQLAttributes
     */
    public async getOne(excludedSQLAttributes?: string[]): Promise<EntityType> {
        const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
        const result: EntityType[] = await this.select(attributes, this.filter);

        if (result.length <= 1) {
            return result[0];
        }

        const errorMsg = `${loggerString(__dirname, EntityFacade.name, "getOne")} More than one result returned! (${result.length})`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
    }

    /**
     * returns the facade filter that can be used for filtering model with id
     */
    get idFilter(): Filter {
        return this.filter;
    }

}
