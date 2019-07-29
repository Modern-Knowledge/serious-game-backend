import { BaseFacade } from "../BaseFacade";
import { AbstractModel } from "../../lib/models/AbstractModel";

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
}
