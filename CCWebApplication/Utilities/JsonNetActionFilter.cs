using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CCWebApplication.Utilities
{
    public class JsonNetActionFilter : ActionFilterAttribute
    {
        public override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            if (filterContext.Result.GetType() == typeof(JsonResult))
            {
                // Get the standard result object with unserialized data
                JsonResult result = filterContext.Result as JsonResult;

                // Replace it with our new result object and transfer settings

                if (result != null)
                    filterContext.Result = new JsonNetResult
                    {
                        ContentEncoding = result.ContentEncoding,
                        ContentType = result.ContentType,
                        Data = result.Data,
                        JsonRequestBehavior = result.JsonRequestBehavior,
                        MaxJsonLength = int.MaxValue,
                    };

            }
            base.OnActionExecuted(filterContext);
        }
    }
}