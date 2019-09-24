import { UserFacade } from "./UserFacade";
import { Therapist } from "../../../lib/models/Therapist";
import { User } from "../../../lib/models/User";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLComparisonOperator } from "../../sql/SQLComparisonOperator";
import { SQLJoin } from "../../sql/SQLJoin";
import { JoinType } from "../../sql/enums/JoinType";
import { SQLBlock } from "../../sql/SQLBlock";
import { Filter } from "../../filter/Filter";
import { JoinCardinality } from "../../sql/enums/JoinCardinality";
import { CompositeFacade } from "../../composite/CompositeFacade";
import { Ordering } from "../../order/Ordering";

/**
 * handles CRUD operations with the therapist-entity
 * contained Facades:
 * - UserFacade
 *
 * contained Joins:
 * - users (1:1)
 */
export class TherapistFacade extends CompositeFacade<Therapist> {

    private _userFacade: UserFacade;

    private _withUserJoin: boolean;

    /**
     * @param tableAlias
     */
    public constructor(tableAlias?: string) {
        if (tableAlias) {
            super("therapists", tableAlias);
        } else {
            super("therapists", "t");
        }

        this._userFacade = new UserFacade("ut");

        this._withUserJoin = true;
    }

    /**
     * returns sql attributes that should be retrieved from the database
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["therapist_id", "role"];

        const therapistAttributes: SQLAttributes = new SQLAttributes(this.tableAlias, sqlAttributes);

        if (this._withUserJoin) {
            const userAttributes: SQLAttributes = this._userFacade.getSQLAttributes(excludedSQLAttributes);
            therapistAttributes.addSqlAttributes(userAttributes);
        }

        return therapistAttributes;
    }

    /**
     * inserts a new therapist and returns the created therapist
     * @param therapist
     */
    public async insertTherapist(therapist: Therapist): Promise<Therapist> {
        const t: User = await this._userFacade.insertUser(therapist);

        const attributes: SQLValueAttributes = this.getSQLValueAttributes(this.tableName, therapist);

        const therapistIdAttribute: SQLValueAttribute = new SQLValueAttribute("therapist_id", this.tableName, t.id);
        attributes.addAttribute(therapistIdAttribute);

        return new Promise<Therapist>((resolve, reject) => {
            this.insert(attributes).then(id => {
                if (id >= 0) {
                    therapist.id = t.id;
                    therapist.createdAt = t.createdAt;
                    resolve(therapist);
                }
            });
        });
    }

    /**
     * updates the given therapist in the database and returns the number of affected rows
     * @param therapist
     */
    public async updateTherapist(therapist: Therapist): Promise<number> {
        const attributes: SQLValueAttributes = this.getSQLValueAttributes(this.tableAlias, therapist);

        const userRows: number = await this._userFacade.updateUser(therapist);
        const therapistRows: number = await this.update(attributes);

        return userRows + therapistRows;
    }

    /**
     * deletes the specified therapist in the database and returns the number of affected rows
     * @param therapist
     */
    public async deleteTherapist(therapist: Therapist): Promise<number> {
        return await this.delete([this._userFacade]);
    }

    /**
     * fills the entity
     * @param result result for filling
     */
    public fillEntity(result: any): Therapist {
        const t: Therapist = new Therapist();

        if (this._withUserJoin) {
            this._userFacade.fillUserEntity(result, t);
        }

        if (result[this.name("role")] !== undefined) {
            t.role = result[this.name("role")];
        }

        return t;
    }

    /**
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
     * @param therapist entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, therapist: Therapist): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const birthdayAttribute: SQLValueAttribute = new SQLValueAttribute("birthday", prefix, therapist.role);
        attributes.addAttribute(birthdayAttribute);

        return attributes;
    }

    /**
     * creates the joins for the therapist facade and returns them as a list
     */
    get joins(): SQLJoin[] {
        const joins: SQLJoin[] = [];

        if (this._withUserJoin) {
            const userJoin: SQLBlock = new SQLBlock();
            userJoin.addText(`${this.tableAlias}.therapist_id = ${this._userFacade.tableAlias}.id`);
            joins.push(new SQLJoin(this._userFacade.tableName, this._userFacade.tableAlias, userJoin, JoinType.JOIN, JoinCardinality.ONE_TO_ONE));
        }

        return joins;
    }

    /**
     * returns the facade filter that can be used for filtering model with id
     */
    get idFilter(): Filter {
        return new Filter(this._userFacade.tableAlias);
    }

    /**
     * returns all sub facade filters of the facade as an array
     */
    protected get filters(): Filter[] {
        return [
            this.userFacadeFilter
        ];
    }

    /**
     * returns the userFacadeFilter
     */
    get userFacadeFilter(): Filter {
        return this._userFacade.filter;
    }

    /**
     * returns all sub facade order-bys of the facade as an array
     */
    protected get orderBys(): Ordering[] {
        return [
            this.userFacadeOrderBy
        ];
    }

    get userFacadeOrderBy(): Ordering {
        return this._userFacade.ordering;
    }

    get withUserJoin(): boolean {
        return this._withUserJoin;
    }

    set withUserJoin(value: boolean) {
        this._withUserJoin = value;
    }
}
