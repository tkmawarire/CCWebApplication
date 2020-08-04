using System.Web.Mvc;

namespace CCWebApplication.Controllers
{
    public class LeakagesController : Controller
    {
        public ActionResult LeakageCharts()
        {
            return View();
        }

        public ActionResult LeakageHeatMap()
        {
            return View();
        }

    }
}