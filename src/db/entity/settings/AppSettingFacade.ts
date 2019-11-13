import { AppSetting } from "../../../lib/models/AppSetting";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { EntityFacade } from "../EntityFacade";

/**
 * handles CRUD operations with app-setting-entity
 */
export class AppSettingFacade extends EntityFacade<AppSetting> {

    /**
     * @param tableAlias table-alias of the facade
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
        if (!result[this.name("id")]) {
            return undefined;
        }

        const appSetting: AppSetting = new AppSetting();

        this.fillDefaultAttributes(result, appSetting);

        return appSetting;
    }

}
