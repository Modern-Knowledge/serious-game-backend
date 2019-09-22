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
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = [];

        return super.getSQLAttributes(excludedSQLAttributes, sqlAttributes);
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
