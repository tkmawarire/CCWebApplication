using System.Web;
using System.Web.Mvc;
using CCWebApplication.Utilities;

namespace CCWebApplication
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
            filters.Add(new JsonNetActionFilter());
        }
    }
}
