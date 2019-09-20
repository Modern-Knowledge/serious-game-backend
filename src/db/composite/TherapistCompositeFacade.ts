import { EntityFacade } from "../entity/EntityFacade";
import { Therapist } from "../../lib/models/Therapist";
import { TherapistFacade } from "../entity/user/TherapistFacade";
import { PatientFacade } from "../entity/user/PatientFacade";
import { SQLAttributes } from "../sql/SQLAttributes";
import { SQLJoin } from "../sql/SQLJoin";
import { SQLBlock } from "../sql/SQLBlock";
import { JoinType } from "../sql/JoinType";
import { TherapistsPatientsFacade } from "../entity/user/TherapistsPatientsFacade";
import { Patient } from "../../lib/models/Patient";
import { SessionFacade } from "../entity/game/SessionFacade";
import { Session } from "../../lib/models/Session";
import { Helper } from "../../util/Helper";
import { Filter } from "../filter/Filter";

/**
 * retrieves composites therapists
 * Joins:
 * - therapists_patients (1:n)
 * - patients (1:n)
 *   - users (1:1)
 * - sessions (1:n)
 */
export class TherapistCompositeFacade extends EntityFacade<Therapist> {

  private _therapistFacade: TherapistFacade;
  private _patientFacade: PatientFacade;
  private _therapistPatientFacade: TherapistsPatientsFacade;
  private _sessionFacade: SessionFacade;

  private _withUserJoin: boolean;
  private _withPatientJoin: boolean;
  private _withSessionJoin: boolean;

  /**
   * @param tableAlias
   */
  public constructor(tableAlias?: string) {
    if (tableAlias) {
      super("therapists", tableAlias);
    } else {
      super("therapists", "t");
    }

    this._therapistFacade = new TherapistFacade();
    this._patientFacade = new PatientFacade();
    this._therapistPatientFacade = new TherapistsPatientsFacade();
    this._sessionFacade = new SessionFacade();

    this._withUserJoin = true;
    this._withPatientJoin = true;
    this._withSessionJoin = true;
  }

  /**
   * @param excludedSQLAttributes
   */
  public getSQLAttributes(excludedSQLAttributes?: string[]): SQLAttributes {
    const returnAttributes: SQLAttributes = new SQLAttributes();

    returnAttributes.addSqlAttributes(this._therapistFacade.getSQLAttributes(excludedSQLAttributes));

    if(this._withPatientJoin) {
      returnAttributes.addSqlAttributes(this._patientFacade.getSQLAttributes(excludedSQLAttributes));
      returnAttributes.addSqlAttributes(this._therapistPatientFacade.getSQLAttributes(excludedSQLAttributes));
    }

    if(this._withSessionJoin) {
      returnAttributes.addSqlAttributes(this._sessionFacade.getSQLAttributes(excludedSQLAttributes));
    }

    return returnAttributes;
  }

  /**
   * fills the entity
   * @param result result for filling
   */
  protected fillEntity(result: any): Therapist {
    const t: Therapist = this._therapistFacade.fillEntity(result);
    if(this._withPatientJoin) {
      const p: Patient = this._patientFacade.fillEntity(result);
      t.addPatient(p);
    }

    if(this._withSessionJoin) {
      const s: Session = this._sessionFacade.fillEntity(result);
      t.addSession(s);
    }

    return t;
  }

  /**
   * creates the joins for the composite therapists and returns them as a list
   */
  get joins(): SQLJoin[] {
    let joins: SQLJoin[] = [];

    joins = joins.concat(this._therapistFacade.joins); // add therapist joins (user)

    if (this._withPatientJoin) {
      const therapistPatientJoin: SQLBlock = new SQLBlock();
      therapistPatientJoin.addText(`${this._therapistPatientFacade.tableAlias}.therapist_id = ${this.tableAlias}.therapist_id`);
      joins.push(new SQLJoin(this._therapistPatientFacade.tableName, this._therapistPatientFacade.tableAlias, therapistPatientJoin, JoinType.JOIN));

      const patientTherapistJoin: SQLBlock = new SQLBlock();
      patientTherapistJoin.addText(`${this._therapistPatientFacade.tableAlias}.patient_id = ${this._patientFacade.tableAlias}.patient_id`);
      joins.push(new SQLJoin(this._patientFacade.tableName, this._patientFacade.tableAlias, patientTherapistJoin, JoinType.JOIN));

      joins = joins.concat(this._patientFacade.joins); // add patient joins (user)
    }

    if (this._withSessionJoin) {
      const sessionJoin: SQLBlock = new SQLBlock();
      sessionJoin.addText(`${this._sessionFacade.tableAlias}.therapist_id = ${this.tableAlias}.therapist_id`);
      joins.push(new SQLJoin(this._sessionFacade.tableName, this._sessionFacade.tableAlias, sessionJoin, JoinType.JOIN));
    }

    return joins;
  }

  /**
   * @param entities
   */
  protected postProcessSelect(entities: Therapist[]): Therapist[] {
    const therapistMap = new Map<number, Therapist>();

    for (const therapist of entities) {
      if (!therapistMap.has(therapist.id)) {
        therapistMap.set(therapist.id, therapist)
      } else {
        const existingTherapist: Therapist = therapistMap.get(therapist.id);

        if(!Helper.arrayContainsModel(therapist.patients[0], existingTherapist.patients)) {
          existingTherapist.addPatients(therapist.patients);
        }

        if(!Helper.arrayContainsModel(therapist.sessions[0], existingTherapist.sessions)) {
          existingTherapist.addSessions(therapist.sessions);
        }
      }
    }

    return Array.from(therapistMap.values());
  }

  get therapistUserFacadeFilter(): Filter {
    return this._therapistFacade.userFacadeFilter;
  }

  get patientUserFacadeFilter(): Filter {
    return this._patientFacade.userFacadeFilter;
  }

  get sessionFacadeFilter(): Filter {
    return this._sessionFacade.filter;
  }

  get withUserJoin(): boolean {
    return this._withUserJoin;
  }

  set withUserJoin(value: boolean) {
    this._patientFacade.withUserJoin = value;
    this._therapistFacade.withUserJoin = value;
    this._withUserJoin = value;
  }

  get withPatientJoin(): boolean {
    return this._withPatientJoin;
  }

  set withPatientJoin(value: boolean) {
    this._withPatientJoin = value;
  }

  get withSessionJoin(): boolean {
    return this._withSessionJoin;
  }

  set withSessionJoin(value: boolean) {
    this._withSessionJoin = value;
  }
}