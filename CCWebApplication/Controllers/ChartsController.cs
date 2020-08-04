using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CCWebApplicationDAL.SystemEntities;
using Newtonsoft.Json.Linq;

namespace CCWebApplication.Controllers
{
    public class ChartsController : Controller
    {
        //Model Name: GccSytemModel   Entities:GccSytemEntities
        private readonly GccSytemEntities _db = new GccSytemEntities();
        public ActionResult LeakageResult()
        {
            var pipeLeakages = _db.leakages.Where(c => c.Source.Equals("Pipe"));
            var meterLeakages = _db.leakages.Where(c => c.Source.Equals("Meter"));
            var bulkmtrLeakages = _db.leakages.Where(c => c.Source.Equals("Bulk Meter"));
            var valveLeakage = _db.leakages.Where(c => c.Source.Equals("Valve"));
            var hydrantLeakage = _db.leakages.Where(c => c.Source.Equals("Hydrant"));

            dynamic pipeLeakageObject = new JObject();
            pipeLeakageObject.key = "Pipe Leaks";
            pipeLeakageObject.y = pipeLeakages.Count();

            dynamic meterLeakageObject = new JObject();
            meterLeakageObject.key = "Meter Leaks";
            meterLeakageObject.y = meterLeakages.Count();

            dynamic bulkmeterLeakageObject = new JObject();
            bulkmeterLeakageObject.key = "Bulk Meter Leaks";
            bulkmeterLeakageObject.y = bulkmtrLeakages.Count();

            dynamic valveLeakageObject = new JObject();
            valveLeakageObject.key = "Valve Leaks";
            valveLeakageObject.y = valveLeakage.Count();

            dynamic hydrantLeakageObject = new JObject();
            hydrantLeakageObject.key = "Hydrant Leaks";
            hydrantLeakageObject.y = hydrantLeakage.Count();

            var leakageArray = new JArray();
            leakageArray.Add(hydrantLeakageObject);
            leakageArray.Add(pipeLeakageObject);
            leakageArray.Add(valveLeakageObject);
            leakageArray.Add(meterLeakageObject);
            leakageArray.Add(bulkmeterLeakageObject);

            return Json(leakageArray, JsonRequestBehavior.AllowGet);
        }
        public ActionResult LeakageHistogram()
        {
            var pipeLeakages = _db.leakages.Where(c => c.Source.Equals("Pipe"));
            var meterLeakages = _db.leakages.Where(c => c.Source.Equals("Meter"));
            var bulkmtrLeakages = _db.leakages.Where(c => c.Source.Equals("Bulk Meter"));
            var valveLeakage = _db.leakages.Where(c => c.Source.Equals("Valve"));
            var hydrantLeakage = _db.leakages.Where(c => c.Source.Equals("Hydrant"));

            dynamic pipeLeakageObject = new JObject();
            pipeLeakageObject.label = "Pipe Leaks";
            pipeLeakageObject.value = pipeLeakages.Count();

            dynamic meterLeakageObject = new JObject();
            meterLeakageObject.label = "Meter Leaks";
            meterLeakageObject.value = meterLeakages.Count();

            dynamic bulkmeterLeakageObject = new JObject();
            bulkmeterLeakageObject.label = "Bulk Meter Leaks";
            bulkmeterLeakageObject.value = bulkmtrLeakages.Count();

            dynamic valveLeakageObject = new JObject();
            valveLeakageObject.label = "Valve Leaks";
            valveLeakageObject.value = valveLeakage.Count();

            dynamic hydrantLeakageObject = new JObject();
            hydrantLeakageObject.label = "Hydrant Leaks";
            hydrantLeakageObject.value = hydrantLeakage.Count();

            var leakageArray = new JArray();
            leakageArray.Add(hydrantLeakageObject);
            leakageArray.Add(pipeLeakageObject);
            leakageArray.Add(valveLeakageObject);
            leakageArray.Add(meterLeakageObject);
            leakageArray.Add(bulkmeterLeakageObject);

            return Json(leakageArray, JsonRequestBehavior.AllowGet);
        }
        public ActionResult LeakageAreaHistogram()
        {
            var Mkoba = _db.vwleakageTowns.Where(c => c.Name.Equals("Mkoba"));
            dynamic mkob = new JObject();
            mkob.label = "Mkoba";
            mkob.value = Mkoba.Count();

            var Ivene = _db.vwleakageTowns.Where(c => c.Name.Equals("Ivene"));
            dynamic iveneob = new JObject();
            iveneob.label = "Ivene";
            iveneob.value = Ivene.Count();

            var Southdowns = _db.vwleakageTowns.Where(c => c.Name.Equals("Southdowns"));
            dynamic stdwnob = new JObject();
            stdwnob.label = "Southdowns";
            stdwnob.value = Southdowns.Count();

            var Southview = _db.vwleakageTowns.Where(c => c.Name.Equals("Southview"));
            dynamic southviewob = new JObject();
            southviewob.label = "Southview";
            southviewob.value = Southview.Count();

            var CentralBusinessDistrict = _db.vwleakageTowns.Where(c => c.Name.Equals("Central Business District"));
            dynamic cbdob = new JObject();
            cbdob.label = "CBD";
            cbdob.value = CentralBusinessDistrict.Count();

            var GweruEast = _db.vwleakageTowns.Where(c => c.Name.Equals("Gweru East"));
            dynamic gwerueastob = new JObject();
            gwerueastob.label = "Gweru East";
            gwerueastob.value = GweruEast.Count();

            var Nashville = _db.vwleakageTowns.Where(c => c.Name.Equals("Nashville"));
            dynamic nashob = new JObject();
            nashob.label = "Nashville";
            nashob.value = Nashville.Count();

            var Clonsilla = _db.vwleakageTowns.Where(c => c.Name.Equals("Clonsilla"));
            dynamic consiob = new JObject();
            consiob.label = "Clonsilla";
            consiob.value = Clonsilla.Count();

            var Athlone = _db.vwleakageTowns.Where(c => c.Name.Equals("Athlone"));
            dynamic athloneob = new JObject();
            athloneob.label = "Athlone";
            athloneob.value = Athlone.Count();

            var Riverside = _db.vwleakageTowns.Where(c => c.Name.Equals("Riverside"));
            dynamic riversideob = new JObject();
            riversideob.label = "Riverside";
            riversideob.value = Riverside.Count();

            var Winsor = _db.vwleakageTowns.Where(c => c.Name.Equals("Winsor"));
            dynamic winsorob = new JObject();
            winsorob.label = "Windsor";
            winsorob.value = Winsor.Count();

            var Lundi = _db.vwleakageTowns.Where(c => c.Name.Equals("Lundi"));
            dynamic lundiob = new JObject();
            lundiob.label = "Lundi";
            lundiob.value = Lundi.Count();

            var Kopje = _db.vwleakageTowns.Where(c => c.Name.Equals("Kopje"));
            dynamic kopjeob = new JObject();
            kopjeob.label = "Kopje";
            kopjeob.value = Ivene.Count();

            var Daylseford = _db.vwleakageTowns.Where(c => c.Name.Equals("Daylseford"));
            dynamic daylsefordob = new JObject();
            daylsefordob.label = "Daylseford";
            daylsefordob.value = Daylseford.Count();

            var HarbenPark = _db.vwleakageTowns.Where(c => c.Name.Equals("Harben Park"));
            dynamic hrbnparkob = new JObject();
            hrbnparkob.label = "Harben Park";
            hrbnparkob.value = HarbenPark.Count();

            var RidgemontHeights = _db.vwleakageTowns.Where(c => c.Name.Equals("Ridgemont Heights"));
            dynamic rdgyob = new JObject();
            rdgyob.label = "Ridgemont";
            rdgyob.value = RidgemontHeights.Count();

            var Mambo = _db.vwleakageTowns.Where(c => c.Name.Equals("Mambo"));
            dynamic mamboob = new JObject();
            mamboob.label = "Mambo";
            mamboob.value = Mambo.Count();

            var Ascot = _db.vwleakageTowns.Where(c => c.Name.Equals("Ascot"));
            dynamic asctob = new JObject();
            asctob.label = "Ascot";
            asctob.value = Ascot.Count();

            var Brakenhurst = _db.vwleakageTowns.Where(c => c.Name.Equals("Brakenhurst"));
            dynamic braknob = new JObject();
            braknob.label = "Brakenhurst";
            braknob.value = Brakenhurst.Count();

            var LightIndustrialArea = _db.vwleakageTowns.Where(c => c.Name.Equals("Light Industrial Area"));
            dynamic litazob = new JObject();
            litazob.label = "L.Industrial";
            litazob.value = LightIndustrialArea.Count();

            var HeavyIndustrialArea = _db.vwleakageTowns.Where(c => c.Name.Equals("Heavy Industrial Area"));
            dynamic heavyob = new JObject();
            heavyob.label = "H.Industrial";
            heavyob.value = HeavyIndustrialArea.Count();

            var Nehosho = _db.vwleakageTowns.Where(c => c.Name.Equals("Nehosho"));
            dynamic neshob = new JObject();
            neshob.label = "Nehosho";
            neshob.value = Nehosho.Count();

            var Senga = _db.vwleakageTowns.Where(c => c.Name.Equals("Senga"));
            dynamic Sengaob = new JObject();
            Sengaob.label = "Senga";
            Sengaob.value = Senga.Count();

            var KPMGhousing = _db.vwleakageTowns.Where(c => c.Name.Equals("KPMG housing"));
            dynamic KPMGhousingob = new JObject();
            KPMGhousingob.label = "KPMG";
            KPMGhousingob.value = KPMGhousing.Count();

            var leakageArray = new JArray();
            leakageArray.Add(KPMGhousingob);
            leakageArray.Add(mkob);
            leakageArray.Add(iveneob);
            leakageArray.Add(stdwnob);

            leakageArray.Add(southviewob);
            leakageArray.Add(cbdob);
            leakageArray.Add(gwerueastob);

            leakageArray.Add(nashob);
            leakageArray.Add(consiob);
            leakageArray.Add(athloneob);
            leakageArray.Add(riversideob);
            leakageArray.Add(winsorob);
            leakageArray.Add(lundiob);
            leakageArray.Add(kopjeob);
            leakageArray.Add(daylsefordob);
            leakageArray.Add(hrbnparkob);
            leakageArray.Add(rdgyob);
            leakageArray.Add(mamboob);
            leakageArray.Add(asctob);
            leakageArray.Add(braknob);
            leakageArray.Add(litazob);
            //leakageArray.Add(neshob);
            leakageArray.Add(Sengaob);
            //leakageArray.Add(KPMGhousingob);


            return Json(leakageArray, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetMeterCondition()
        {
            var working = _db.vwStands.Where(c => c.CONDITION.StartsWith("WORKING"));

            dynamic workingob = new JObject();
            workingob.label = "Working Meters";
            workingob.value = working.Count();

            var not_working = _db.vwStands.Where(c => c.CONDITION.Equals("NOT WORKING "));

            dynamic ntworkingob = new JObject();
            ntworkingob.label = "Not Working";
            ntworkingob.value = not_working.Count();

            var tempered = _db.vwStands.Where(c => c.CONDITION.Equals("TEMPERED "));
            dynamic temperedmtrs = new JObject();
            temperedmtrs.label = "Tempered Meters";
            temperedmtrs.value = tempered.Count();

            var mtrArray = new JArray();
            mtrArray.Add(workingob);
            mtrArray.Add(ntworkingob);
            mtrArray.Add(temperedmtrs);
            return Json(mtrArray, JsonRequestBehavior.AllowGet);

        }
        public ActionResult GetIllegalCon()
        {
            var illegalcon = _db.vwStands.Where(c => c.ILLEGAL_CONNECTION_.Equals("NO") && c.ILLEGAL_CONNECTION_.Equals("NONE"));
            var total = _db.vwStands.Count();
            var percentageComplete = (illegalcon.Count() / total) * 100;
            dynamic illegalobject = new JObject();
            dynamic totaloject = new JObject();
            illegalobject.key = "Illegal Connections";
            illegalobject.y = illegalcon.Count();

            totaloject.key = "Total# of Stands";
            totaloject.y = total;
            var array = new JArray();
            array.Add(illegalobject);
            array.Add(totaloject);

            return Json(array, JsonRequestBehavior.AllowGet);
        }
    }
}