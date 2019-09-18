import { EntityFacade } from "../EntityFacade";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { AppSetting } from "../../../lib/models/AppSetting";

/**
 * handles CRUD operations with app-setting-entity
 */
export class AppSettingFacade extends EntityFacade<AppSetting> {

  /**
   * @param tableAlias
   */
  public constructor(tableAlias?: string) {
    if (tableAlias) {
      super("app_settings", tableAlias);
    } else {
      super("app_settings", "ap");
    }
  }

  /**
   * returns SQL-attributes for the app-settings
   * @param excludedSQLAttributes sql attributes that are excluded from the query
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const sqlAttributes: string[] = [];

    return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
  }

  /**
   * returns app-settings that match the specified filter
   * @param excludedSQLAttributes
   */
  public getAppSettings(excludedSQLAttributes?: string[]): Promise<AppSetting[]> {
    const attributes: SQLAttributes = this.getSQLAttributes(excludedSQLAttributes);
    return this.select(attributes, this.getJoins());
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  protected fillEntity(result: any): AppSetting {
    const appSetting: AppSetting = new AppSetting();

    this.fillDefaultAttributes(result, appSetting);

    return appSetting;
  }

}
