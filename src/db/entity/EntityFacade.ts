import { BaseFacade } from "../BaseFacade";

export abstract class EntityFacade<EntityType, FilterType> extends BaseFacade<EntityType, FilterType> {

  protected constructor(tableName: string, tableAlias: string) {
    super(tableName, tableAlias);
  }
}
