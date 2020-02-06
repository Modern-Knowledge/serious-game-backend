
import { AbstractModel } from "../../lib/models/AbstractModel";
import { loggerString } from "../../util/Helper";
import logger from "../../util/log/logger";
import { BaseFacade } from "../BaseFacade";
import { Filter } from "../filter/Filter";
import { SQLComparisonOperator } from "../sql/enums/SQLComparisonOperator";
import { SQLAttributes } from "../sql/SQLAttributes";

/**
 * Base facade for entities
 * Provides common methods for retrieving values from the database.
 */
export abstract class EntityFacade<EntityType extends AbstractModel<EntityType>> extends BaseFacade<EntityType> {

    /**
     * @param tableName table-name of the entity
     * @param tableAlias table-alias of the entity
     */
    protected constructor(tableName: string, tableAlias: string) {
        super(tableName, tableAlias);
    }

  /**
   * Returns an entity by id.
   *
   * @param id id of the entity to receive
   * @param excludedSQLAttributes attribute that should not be included in the result set
   */
    public async getById(id: number, excludedSQLAttributes?: string[]): Promise<EntityType> {
        const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
        this.idFilter.addFilterCondition("id", id, SQLComparisonOperator.EQUAL);
        const result: EntityType[] = await this.select(attributes, this.idFilter);

        this.idFilter.clear();

        return result[0];
    }

    /**
     * Returns all entities that match the specified filter.
     *
     * @param excludedSQLAttributes attributes that should be excluded from the query
     */
    public async get(excludedSQLAttributes?: string[]): Promise<EntityType[]> {
      const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
      return this.select(attributes, this.filter);
    }

    /**
     * Returns the first entity that matches the specified filter.
     * Only the first entity of the result-set is being returned.
     * If more than one result is returned an error is thrown.
     *
     * @param excludedSQLAttributes attributes that should be excluded from the query
     */
    public async getOne(excludedSQLAttributes?: string[]): Promise<EntityType> {
        const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
        const result: EntityType[] = await this.select(attributes, this.filter);

        if (result.length <= 1) {
            return result[0];
        }

        const errorMsg = `${loggerString(__dirname, EntityFacade.name, "getOne")}
        More than one result returned! (${result.length})`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
    }

    /**
     * Returns the facade filter that can be used for filtering model with id.
     */
    get idFilter(): Filter {
        return this.filter;
    }

}
