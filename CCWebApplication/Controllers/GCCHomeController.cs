using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CCWebApplication.Controllers
{
    public class GccHomeController : Controller
    {
        // GET: GCCHome
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Public()
        {
            return View();
        }
        public ActionResult Finance()
        {
            return View();
        }

        public ActionResult FinanceVisualization()
        {
            return View();
        }
        public ActionResult Housing()
        {
            return View();
        }
        public ActionResult Engineering()
        {
            return View();
        }

        public ActionResult Water()
        {
            return View();
        }

    }
}