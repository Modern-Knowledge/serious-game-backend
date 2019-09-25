import express, { Request, Response } from "express";
import { UserFacade } from "../db/entity/user/UserFacade";
import { SQLOrder } from "../db/sql/SQLOrder";
import { Filter } from "../db/filter/Filter";
import { TherapistFacade } from "../db/entity/user/TherapistFacade";
import { PatientFacade } from "../db/entity/user/PatientFacade";
import { TherapistCompositeFacade } from "../db/composite/TherapistCompositeFacade";
import { SessionCompositeFacade } from "../db/composite/SessionCompositeFacade";
import { User } from "../lib/models/User";
import { Mail } from "../util/mail/Mail";
import { passwordReset } from "../mail-texts/passwordReset";
import { MailPriority } from "../util/mail/MailPriority";
import { Attachment } from "../util/mail/Attachment";
import { TherapistsPatientsFacade } from "../db/entity/user/TherapistsPatientsFacade";
import { TherapistPatient } from "../lib/models/TherapistPatient";
import { mailTransport } from "../util/mail/mailTransport";
import { GameCompositeFacade } from "../db/composite/GameCompositeFacade";
import { Patient } from "../lib/models/Patient";
import { Therapist } from "../lib/models/Therapist";
import { StatisticCompositeFacade } from "../db/composite/StatisticCompositeFacade";
import { PatientCompositeFacade } from "../db/composite/PatientCompositeFacade";
import {StatisticFacade} from "../db/entity/game/StatisticFacade";
import {Statistic} from "../lib/models/Statistic";
const router = express.Router();

/**
 * GET /
 * Home page.
 */
router.get("/", async (req: Request, res: Response) => {
     const facade: UserFacade = new UserFacade("u");
     // const user = await facade.getById(1);
     // console.log(user.fullNameWithSirOrMadam);
    // facade.addOrderBy("id", SQLOrder.DESC);
    // //
    // const filter: Filter = facade.filter;
    // // filter.addFilterAttribute(new FilterAttribute("der", "asdasd", SQLComparisonOperator.EQUAL));
    // //
    // // const users = await facade.getUsers();
    // //
    // // const u: User = new User();
    // // await facade.insertUser(u);
    //
    // const therapistFacade: TherapistFacade = new TherapistFacade();
    // const therapists = await therapistFacade.get();
    //
    // const patientFacade: PatientFacade = new PatientFacade();
    // const patients = await patientFacade.get();

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

     // const therapistCompFacade = new TherapistCompositeFacade();
    // const theraUserFilter = therapistCompFacade.therapistUserFacadeFilter;
    // const patientUserFilter = therapistCompFacade.patientUserFacadeFilter;
    // const sessionFilter = therapistCompFacade.sessionFacadeFilter;
    //
     // const theraOrderBy = therapistCompFacade.therapistUserFacadeOrderBy;
     // theraOrderBy.addOrderBy("id");
    //
    //
    // // const patientOrderBy = therapistCompFacade.patientUserFacadeOrderBy;
    // // patientOrderBy.push(new SQLOrderBy("id", SQLOrder.ASC, "up"));
    //
    // const thera = await therapistCompFacade.getById(1);

    // console.log(thera);
    //
    //  const helptextFacade = new HelptextFacade();
    //  console.log(await helptextFacade.getHelptexts());
    //
    //  const errortextFacade = new ErrortextFacade();
    //  console.log(await errortextFacade.getErrorTexts());
    //
    const statistic: Statistic = new Statistic();
      const statisticFacade = new StatisticFacade();
      statisticFacade.insertStatistic(statistic);
    //
     const statisticCompFacade = new StatisticCompositeFacade();
     statisticCompFacade.errortextStatisticFilter.addFilterCondition("statistic_id", 0);
    statisticCompFacade.filter.addFilterCondition("id", 0);
    // const statisticComp = await statisticCompFacade.deleteStatisticComposite();

    // console.log(statisticComp);
    //
     const patientCompositeFacade = new PatientCompositeFacade();
     patientCompositeFacade.patientSettingFacadeFilter.addFilterCondition("id", 0);
     patientCompositeFacade.patientUserFacadeFilter.addFilterCondition("id", 0);
     patientCompositeFacade.filter.addFilterCondition("patient_id", 0);
    // const patientComp = await patientCompositeFacade.deletePatientComposite();
    //
     const gameCompositeFacade = new GameCompositeFacade();
    // const gamesComp = await gameCompositeFacade.getById(1);
     // console.log(gamesComp);
    //
    // const sessionFacade = new SessionFacade();
    // const sess = await sessionFacade.getSessions();
    // console.log(sess);

     const sessionCompositeFacade = new SessionCompositeFacade();
     sessionCompositeFacade.filter.addFilterCondition("id", 0);
     sessionCompositeFacade.statisticFacadeFilter.addFilterCondition("id", 0);
     sessionCompositeFacade.errortextStatisticFacadeFilter.addFilterCondition("statistic_id", 0);
     // const sessions = await sessionCompositeFacade.deleteSessionComposite();
      // console.log(sessions);
    //
    // // sessionCompositeFacade.postProcessFilter;
    //
    const u = new Therapist();
    u.gender = 0;
    u.forename = "Florian";
    u.lastname = "Mold";
    u.email = "florian.mold@live.at";
    u.password = "dklfjslkdf0";

    const m = new Mail([u.recipient], passwordReset, [u.fullNameWithSirOrMadam, "1234456"]);

     // mailTransport.sendMail(m);

    const therapistPatient = new TherapistPatient();
    therapistPatient.patientId = 501;
    therapistPatient.therapistId = 3;

     // const therapistsPatientsFacade = new TherapistsPatientsFacade();
     // therapistsPatientsFacade.filter.addFilterCondition("therapist_id", 6);
     // console.log(await therapistsPatientsFacade.insertTherapistPatient(therapistPatient));

    const userfacade = new UserFacade();
      userfacade.filter.addFilterCondition("id", 1);
      console.log(await userfacade.insertUser(u));

    const patientFacade = new TherapistFacade();
    // patientFacade.isTherapist(1003);
   //  patientFacade.filter.addFilterCondition("therapist_id", 0);
   //  patientFacade.userFacadeFilter.addFilterCondition("id", 0);

    // console.log(await patientFacade.insertTherapist(u));
    // await patientFacade.updateTherapist(u);
    // await patientFacade.updateUserTherapist(u);
   // await patientFacade.deleteTherapist();



    res.jsonp("therapists");
});

export default router;
