/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { UserFacade } from "./UserFacade";
import { Therapist } from "../../../lib/models/Therapist";
import { SQLAttributes } from "../../sql/SQLAttributes";
import { SQLValueAttributes } from "../../sql/SQLValueAttributes";
import { SQLValueAttribute } from "../../sql/SQLValueAttribute";
import { SQLJoin } from "../../sql/SQLJoin";
import { JoinType } from "../../sql/enums/JoinType";
import { SQLBlock } from "../../sql/SQLBlock";
import { Filter } from "../../filter/Filter";
import { JoinCardinality } from "../../sql/enums/JoinCardinality";
import { CompositeFacade } from "../../composite/CompositeFacade";
import { Ordering } from "../../order/Ordering";
import { Roles } from "../../../lib/enums/Roles";

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
     * inserts a new therapist and returns the created therapist
     * @param therapist
     */
    public async insertTherapist(therapist: Therapist): Promise<Therapist> {
        const attributes: SQLValueAttributes = this.getSQLInsertValueAttributes(therapist);

        /**
         * callback that is called after a user was inserted
         * @param insertId user id that was inserted before
         * @param attributes attributes to append to
         */
        const onInsertUser = (insertId: number, attributes: SQLValueAttributes) => {
            therapist.id = insertId;
            const patientIdAttribute: SQLValueAttribute = new SQLValueAttribute("therapist_id", this.tableName, therapist.id);
            attributes.addAttribute(patientIdAttribute);
        };

        await this.insert(attributes, [{facade: this._userFacade, entity: therapist, callBackOnInsert: onInsertUser}, {facade: this, entity: therapist}]);

        return therapist;
    }

    /**
     * updates the patient and the associated user in a transaction
     * @param therapist
     */
    public async updateUserTherapist(therapist: Therapist): Promise<number> {
        const attributes: SQLValueAttributes = this.getSQLUpdateValueAttributes(therapist);
        return this.update(attributes, [{facade: this, entity: therapist}, {facade: this._userFacade, entity: therapist}]);
    }

    /**
     * updates the therapists and returns the number of affected rows
     * @param therapist
     */
    public async updateTherapist(therapist: Therapist): Promise<number> {
        const attributes: SQLValueAttributes = this.getSQLUpdateValueAttributes(therapist);
        return this.update(attributes);
    }

    /**
     * deletes the specified therapist in the database and returns the number of affected rows
     */
    public async deleteTherapist(): Promise<number> {
        return await this.delete([this, this._userFacade]);
    }

    /**
     * checks if the given id belongs to a therapist
     * @param id
     */
    public async isTherapist(id: number): Promise<boolean> {
        const therapist = await this.getById(id);
        return therapist !== undefined;
    }

    /**
     * fills the entity
     * @param result result for filling
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
     * return common sql attributes for insert and update statement
     * @param prefix prefix before the sql attribute
     * @param therapist entity to take values from
     */
    protected getSQLValueAttributes(prefix: string, therapist: Therapist): SQLValueAttributes {
        const attributes: SQLValueAttributes = new SQLValueAttributes();

        const roleAttribute: SQLValueAttribute = new SQLValueAttribute("role", prefix, Roles.USER);
        attributes.addAttribute(roleAttribute);

        const acceptedAttribute: SQLValueAttribute = new SQLValueAttribute("accepted", prefix, therapist.accepted);
        attributes.addAttribute(acceptedAttribute);

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

    /**
     * returns the facade filter that can be used for filtering model with id
     */
    get idFilter(): Filter {
        return this._userFacade.idFilter;
    }

    /**
     * returns all sub facade filters of the facade as an array
     */
    protected get filters(): Filter[] {
        return [this.userFacadeFilter];
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
