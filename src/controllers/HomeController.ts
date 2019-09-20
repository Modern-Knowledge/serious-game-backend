import express, {Request, Response} from "express";
import {UserFacade} from "../db/entity/user/UserFacade";
import {SQLOrder} from "../db/sql/SQLOrder";
import {Filter} from "../db/filter/Filter";
import {SQLComparisonOperator} from "../db/sql/SQLComparisonOperator";
import {TherapistFacade} from "../db/entity/user/TherapistFacade";
import {PatientFacade} from "../db/entity/user/PatientFacade";
import {TherapistCompositeFacade} from "../db/composite/TherapistCompositeFacade";
import {PatientCompositeFacade} from "../db/composite/PatientCompositeFacade";
import {GameCompositeFacade} from "../db/composite/GameCompositeFacade";
import {SessionCompositeFacade} from "../db/composite/SessionCompositeFacade";
import {SQLOperator} from "../db/sql/enums/SQLOperator";

const router = express.Router();

/**
 * GET /
 * Home page.
 */
router.get("/", async (req: Request, res: Response) => {
   const facade: UserFacade = new UserFacade("u");
   facade.addOrderBy("id", SQLOrder.DESC);
  //
   const filter: Filter = facade.filter;
   // filter.addFilterAttribute(new FilterAttribute("der", "asdasd", SQLComparisonOperator.EQUAL));
  //
  //const users = await facade.getUsers();
  //
  // const u: User = new User();
  // await facade.insertUser(u);

 const therapistFacade: TherapistFacade = new TherapistFacade();
  const therapists = await therapistFacade.get();

  const patientFacade: PatientFacade = new PatientFacade();
  const patients = await patientFacade.get();

 /* const patient1 = new Patient();
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
  console.log(newpatient); */

   const therapistCompFacade = new TherapistCompositeFacade();
   const theraUserFilter = therapistCompFacade.therapistUserFacadeFilter;
   const patientUserFilter = therapistCompFacade.patientUserFacadeFilter;
   const sessionFilter = therapistCompFacade.sessionFacadeFilter;

   theraUserFilter.addFilterCondition("id", 1, SQLComparisonOperator.EQUAL, SQLOperator.AND);

 patientUserFilter.addFilterCondition("id", 1, SQLComparisonOperator.EQUAL);
 sessionFilter.addFilterCondition("id", 1, SQLComparisonOperator.EQUAL);
 therapistCompFacade.combineFilters();



 const thera = await therapistCompFacade.get();

   //console.log(thera);
 //
 //  const helptextFacade = new HelptextFacade();
 //  console.log(await helptextFacade.getHelptexts());
 //
 //  const errortextFacade = new ErrortextFacade();
 //  console.log(await errortextFacade.getErrorTexts());
 //
 //  const statisticFacade = new StatisticFacade();
 //  console.log(await statisticFacade.getStatistics());
 //
 // const statisticCompFacade = new StatisticCompositeFacade();
 // const statisticComp = await statisticCompFacade.getStatistics();
 // console.log(statisticComp);
 //
  const patientCompositeFacade = new PatientCompositeFacade();
  const patientComp = await patientCompositeFacade.get();
 //
  const gameCompositeFacade = new GameCompositeFacade();
  const gamesComp = await gameCompositeFacade.get();
  //console.log(gamesComp[0].gameSettings[0]);
  //console.log(gamesComp[0].gameSettings);
 //
 // const sessionFacade = new SessionFacade();
 // const sess = await sessionFacade.getSessions();
 // console.log(sess);

 const sessionCompositeFacade = new SessionCompositeFacade();
 const sessions = await sessionCompositeFacade.get();
 //console.log(sessions);

 sessionCompositeFacade.postProcessFilter


 res.jsonp("therapists");
});

export default router;
