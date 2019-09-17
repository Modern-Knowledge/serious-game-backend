import express, { Request, Response } from "express";
import { UserFacade } from "../db/entity/user/UserFacade";
import { SQLOrder } from "../db/sql/SQLOrder";
import { Filter } from "../db/filter/Filter";
import { FilterAttribute } from "../db/filter/FilterAttribute";
import { SQLComparisonOperator } from "../db/sql/SQLComparisonOperator";
import { TherapistFacade } from "../db/entity/user/TherapistFacade";
import { PatientFacade } from "../db/entity/user/PatientFacade";
import { Status } from "../lib/enums/Status";
import { Therapist } from "../lib/models/Therapist";
import { Patient } from "../lib/models/Patient";
import { TherapistCompositeFacade } from "../db/composite/TherapistCompositeFacade";

const router = express.Router();

/**
 * GET /
 * Home page.
 */
router.get("/", async (req: Request, res: Response) => {
   const facade: UserFacade = new UserFacade("u");
   facade.addOrderBy("id", SQLOrder.DESC);
  //
   const filter: Filter = facade.getFacadeFilter();
   // filter.addFilterAttribute(new FilterAttribute("der", "asdasd", SQLComparisonOperator.EQUAL));
  //
  //const users = await facade.getUsers();
  //
  // const u: User = new User();
  // await facade.insertUser(u);

/* const therapistFacade: TherapistFacade = new TherapistFacade();
  const therapists = await therapistFacade.getTherapists();

  const patientFacade: PatientFacade = new PatientFacade();
  const patients = await patientFacade.getPatients();

  const patient1 = new Patient();
  patient1.id = 1;
  patient1.email = "florian1";
  patient1.password = "dere";
  patient1.forename = "Florian";
  patient1.lastname = "Mold";
  patient1.lastLogin = new Date();
  patient1.failedLoginAttempts = 3;
  patient1.loginCoolDown = new Date();
  patient1.status = Status.ACTIVE;
  patient1.birthday = new Date();


  const newpatient = await patientFacade.deletePatient(patient1);
  console.log(newpatient);*/

  const therapistCompFacade = new TherapistCompositeFacade();
  const lol = await therapistCompFacade.getTherapists();
  console.log(lol[0].patients);

  res.jsonp("therapists");
});

export default router;
