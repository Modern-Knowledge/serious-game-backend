import { BaseFacade } from "../BaseFacade";
import { AbstractModel } from "../../lib/models/AbstractModel";
import { AbstractFilter } from "../AbstractFilter";

export abstract class EntityFacade<EntityType extends AbstractModel, FilterType extends AbstractFilter> extends BaseFacade<EntityType, FilterType> {

  protected constructor(tableName: string, tableAlias: string) {
    super(tableName, tableAlias);
  }
}
