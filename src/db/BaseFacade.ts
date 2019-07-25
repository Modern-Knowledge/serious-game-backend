import { SQLAttributes } from "./sql/SQLAttributes";
import { SQLWhere } from "./sql/SQLWhere";
import { SQLJoin } from "./sql/SQLJoin";
import { SelectQuery } from "./sql/SelectQuery";
import { SQLSelect } from "./sql/SQLSelect";
import { SQLFrom } from "./sql/SQLFrom";
import { BakedQuery } from "./sql/BakedQuery";
import { SQLValueAttributes } from "./sql/SQLValueAttributes";
import { InsertQuery } from "./sql/InsertQuery";
import { SQLInsert } from "./sql/SQLInsert";
import { UpdateQuery } from "./sql/UpdateQuery";
import { SQLUpdate } from "./sql/SQLUpdate";
import { DeleteQuery } from "./sql/DeleteQuery";
import { SQLDelete } from "./sql/SQLDelete";
import { AbstractFilter } from "./AbstractFilter";
import { AbstractModel } from "../lib/models/AbstractModel";
import { DatabaseConnection } from "../util/DatabaseConnection";
import { FieldInfo, MysqlError } from "mysql";

export abstract class BaseFacade<EntityType extends AbstractModel, FilterType extends AbstractFilter> {

  public getSQLAttributes(filter: FilterType): SQLAttributes {
    return new SQLAttributes();
  }

  private _tableName: string;
  private _tableAlias: string;
  private _attributes: string[];

  private readonly _dbInstance: DatabaseConnection;

  protected constructor(tableName: string, tableAlias: string) {
    this._tableName = tableName;
    this._tableAlias = tableAlias;
    this._dbInstance = DatabaseConnection.getInstance();
  }

  public select(attributes: SQLAttributes, joins: SQLJoin[], filter: FilterType): EntityType[] {
    const npq: SelectQuery = this.getSelectQuery(attributes, joins, this.getFilter(filter));

    const selectQuery: BakedQuery = npq.bake();

    let returnEntities: EntityType[] = [];

    const params: string[] = selectQuery.fillParameters();

    this._dbInstance.connection.query(selectQuery.getBakedSQL(), params, (error: MysqlError, results, fields: FieldInfo[]) => {
      if (error) {
        throw error;
      }

      console.log(results);

    });

    returnEntities = this.postProcessSelect(returnEntities);

    return returnEntities;
  }

  public insert(attributes: SQLValueAttributes): void {
     const npq: InsertQuery = this.getInsertQuery(attributes);
     const insertQuery: BakedQuery = npq.bake();
     const params: string[] = insertQuery.fillParameters();

     console.log(insertQuery.getBakedSQL());

      this._dbInstance.connection.query(insertQuery.getBakedSQL(), params, (error: MysqlError, results, fields: FieldInfo[]) => {
       if (error) {
         throw error;
       }

       console.log(results);

    });

  }

  public update(attributes: SQLValueAttributes, where: SQLWhere): void {
    const npq: UpdateQuery = this.getUpdateQuery(attributes, where);
    const updateQuery: BakedQuery = npq.bake();
    const params: string[] = updateQuery.fillParameters();

    console.log(updateQuery.getBakedSQL());

    this._dbInstance.connection.query(updateQuery.getBakedSQL(), params, (error: MysqlError, results, fields: FieldInfo[]) => {
      if (error) {
        throw error;
      }

      console.log(results);

    });
  }

  public delete(filter: FilterType): void {
    // workaround because tableAlias is not allowed in delete statement
    const alias: string = this._tableAlias;
    this._tableAlias = this._tableName;
    const where: SQLWhere = this.getFilter(filter);

    const npq: DeleteQuery = this.getDeleteQuery(where);
    const deleteQuery: BakedQuery = npq.bake();
    const params: string[] = deleteQuery.fillParameters();


    console.log(deleteQuery.getBakedSQL());
    this._tableAlias = alias;
    this._dbInstance.connection.query(deleteQuery.getBakedSQL(), params, (error: MysqlError, results, fields: FieldInfo[]) => {
      if (error) {
        throw error;
      }

      console.log(results);

    });
  }

  private getInsertQuery(attributes: SQLValueAttributes): InsertQuery {
    const insertQuery: InsertQuery = new InsertQuery();

    const insert: SQLInsert = new SQLInsert(this._tableName);

    insert.attributes = attributes;
    insertQuery.insert = insert;

    return insertQuery;
  }

  private getSelectQuery(attributes: SQLAttributes, joins: SQLJoin[], where: SQLWhere): SelectQuery {
    const npq: SelectQuery = new SelectQuery();

    const select: SQLSelect = new SQLSelect(attributes);
    const from: SQLFrom = new SQLFrom(this._tableName, this._tableAlias);

    npq.sqlSelect = select;
    npq.sqlFrom = from;
    npq.addJoins(joins);
    npq.sqlWhere = where;

    return npq;
  }

  private getUpdateQuery(attributes: SQLValueAttributes, where: SQLWhere): UpdateQuery {
    const updateQuery: UpdateQuery = new UpdateQuery();
    const update: SQLUpdate = new SQLUpdate(this._tableName, this._tableAlias);

    update.attributes = attributes;
    updateQuery.update = update;
    updateQuery.where = where;

    return updateQuery;
  }

  private getDeleteQuery(where: SQLWhere): DeleteQuery {
    const deleteQuery: DeleteQuery = new DeleteQuery();

    deleteQuery.delete = new SQLDelete(this._tableName, this._tableAlias);
    deleteQuery.where = where;

    return deleteQuery;
  }

  public abstract getFilter(filter: FilterType): SQLWhere;

  public postProcessSelect(entities: EntityType[]): EntityType[] {
    return entities;
  }

  public name(column: string): string {
    return column + this._tableAlias;
  }

  get tableName(): string {
    return this._tableName;
  }

  set tableName(value: string) {
    this._tableName = value;
  }

  get tableAlias(): string {
    return this._tableAlias;
  }

  set tableAlias(value: string) {
    this._tableAlias = value;
  }

  get attributes(): string[] {
    return this._attributes;
  }

  set attributes(value: string[]) {
    this._attributes = value;
  }
}
