
import { Therapist } from "serious-game-library/dist/models/Therapist";
import { CompositeFacade } from "../../composite/CompositeFacade";
import { Filter } from "../../filter/Filter";
import { Ordering } from "../../order/Ordering";
import { JoinCardinality } from "../../sql/enums/JoinCardinality";
import { JoinType } from "../../sql/enums/JoinType";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLBlock } from "../../sql/SQLBlock";
import { SQLJoin } from "../../sql/SQLJoin";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { UserFacade } from "./UserFacade";

/**
 * Handles CRUD operations with the therapist-entity.
 *
 * contained Facades:
 * - UserFacade
 *
 * contained Joins:
 * - users (1:1)
 */
export class TherapistFacade extends CompositeFacade<Therapist> {
    private readonly _userFacade: UserFacade;

    private _withUserJoin: boolean;

    /**
     * @param tableAlias table-alias of the facade
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
     * Returns sql-attributes that should be retrieved from the database.
     * Combines the attributes from the joined facades.
     *
     * @param excludedSQLAttributes attributes that should not be selected
     */
    public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
        const sqlAttributes: string[] = ["therapist_id", "role", "accepted"];
        let excludedDefaultAttributes: string[] = ["id"];

        if (excludedSQLAttributes) {
            excludedDefaultAttributes = excludedDefaultAttributes.concat(excludedSQLAttributes);
        }

        const therapistsAttributes: SQLAttributes = super.getSQLAttributes(excludedDefaultAttributes, sqlAttributes);

        if (this._withUserJoin) {
            const userAttributes: SQLAttributes = this._userFacade.getSQLAttributes(excludedSQLAttributes);
            therapistsAttributes.addSqlAttributes(userAttributes);
        }

        return therapistsAttributes;
    }

    /**
     * Inserts a new therapist and returns the created therapist.
     *
     * @param therapist therapist that should be inserted
     */
    public async insert(therapist: Therapist): Promise<Therapist> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(therapist);

        /**
         * Callback that is executed after a user was inserted.
         * @param insertId user id that was inserted before
         * @param sqlValueAttributes attributes to append to
         */
        const onInsertUser = (insertId: number, sqlValueAttributes: SQLValueAttributes) => {
            therapist.id = insertId;
            const patientIdAttribute: SQLValueAttribute =
                new SQLValueAttribute("therapist_id", this.tableName, therapist.id);
            sqlValueAttributes.addAttribute(patientIdAttribute);
        };

        await this.insertStatement(attributes, [
            {facade: this._userFacade, entity: therapist, callBackOnInsert: onInsertUser},
            {facade: this, entity: therapist}
            ]);

        return therapist;
    }

    /**
     * Updates therapists and the associated users in a transaction.
     *
     * @param therapist therapist that should be updated
     */
    public async updateUserTherapist(therapist: Therapist): Promise<number> {
        const attributes: SQLValueAttributes = this.getSQLUpdateValueAttributes(therapist);
        return this.updateStatement(attributes, [
                {facade: this, entity: therapist},
                {facade: this._userFacade, entity: therapist}
            ]);
    }

    /**
     * Updates therapists and returns the number of affected rows.
     *
     * @param therapist therapist that should be updated
     */
    public async update(therapist: Therapist): Promise<number> {
        const attributes: SQLValueAttributes = this.getSQLUpdateValueAttributes(therapist);
        return this.updateStatement(attributes);
    }

    /**
     * Deletes the specified therapist and user in the database and
     * returns the number of affected rows.
     */
    public async delete(): Promise<number> {
        return await this.deleteStatement([this, this._userFacade]);
    }

    /**
     * Checks if the given id belongs to a therapist.
     *
     * @param id id of the user to check
     */
    public async isTherapist(id: number): Promise<boolean> {
        const therapist = await this.getById(id);
        return therapist !== undefined;
    }

    /**
     * Fills the therapist-entity from the result.
     *
     * @param result database results
     */
    public fillEntity(result: any): Therapist {
        if (!result[this.name("therapist_id")]) {
            return undefined;
        }

        const t: Therapist = new Therapist();

        if (this._withUserJoin) {
            this._userFacade.fillUserEntity(result, t);
        }

        if (result[this.name("role")]) {
            t.role = result[this.name("role")];
        }

        if (result[this.name("accepted")] !== undefined) {
            t.accepted = result[this.name("accepted")];
        }

        return t;
    }

    /**
     * Returns common sql-attributes for inserts- and updates-statement.
     *
     * @param prefix prefix before the sql-attribute
     * @param therapist entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, therapist: Therapist): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const roleAttribute: SQLValueAttribute = new SQLValueAttribute("role", prefix, therapist.role);
        attributes.addAttribute(roleAttribute);

        const acceptedAttribute: SQLValueAttribute = new SQLValueAttribute("accepted", prefix, therapist.accepted);
        attributes.addAttribute(acceptedAttribute);

        return attributes;
    }

    /**
     * Creates the joins for the therapist facade and returns them as a list.
     */
    get joins(): SQLJoin[] {
        const joins: SQLJoin[] = [];

        if (this._withUserJoin) {
            const userJoin: SQLBlock = new SQLBlock();
            userJoin.addText(`${this.tableAlias}.therapist_id = ${this._userFacade.tableAlias}.id`);
            joins.push(new SQLJoin(
                    this._userFacade.tableName,
                    this._userFacade.tableAlias,
                    userJoin,
                    JoinType.LEFT_JOIN,
                    JoinCardinality.ONE_TO_ONE
                )
            );
        }

        return joins;
    }

    get idFilter(): Filter {
        return this._userFacade.idFilter;
    }

    /**
     * Returns all sub facade filters of the facade as an array.
     */
    protected get filters(): Filter[] {
        return [this.userFacadeFilter];
    }

    get userFacadeFilter(): Filter {
        return this._userFacade.filter;
    }

    /**
     * Returns all sub facade order-bys of the facade as an array.
     */
    protected get orderBys(): Ordering[] {
        return [this.userFacadeOrderBy];
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

    get userFacade(): UserFacade {
        return this._userFacade;
    }
}
