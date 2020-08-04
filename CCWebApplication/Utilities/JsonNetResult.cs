using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;

namespace CCWebApplication.Utilities
{
    public class JsonNetResult : JsonResult
    {
        public JsonNetResult()
        {
            Settings = new JsonSerializerSettings
            {
                ReferenceLoopHandling = ReferenceLoopHandling.Error,
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                NullValueHandling = NullValueHandling.Ignore,
                Converters = new List<JsonConverter> { new StringEnumConverter() }
            };
        }

        public JsonSerializerSettings Settings { get; private set; }
        public override void ExecuteResult(ControllerContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context));

            //trying to set the maximum lenght of the result that is returned to avoid the error system out of memory
            JsonResult responResult = this;
            responResult.MaxJsonLength = int.MaxValue;

            HttpResponseBase response = context.HttpContext.Response;

            if (this.ContentEncoding != null)
                response.ContentEncoding = this.ContentEncoding;
            if (this.Data == null)
                return;
            response.ContentType = string.IsNullOrEmpty(this.ContentType) ? "application/json" : this.ContentType;
            //this.Formatting = Formatting.Indented;
            //var scriptSerializer = JsonSerializer.Create(this.Settings);

            if (this.Data is JsonResult)
            {
                this.Data = ((JsonResult)this.Data).Data;
            }
            response.Write(JsonConvert.SerializeObject(this.Data, Formatting.Indented, Settings));
            // Serialize the data to the Output stream of the response
            //scriptSerializer.Serialize(response.Output, Data);
        }
    }

    public class NewtonsoftJsonResult : JsonResult
    {
        public NewtonsoftJsonResult()
        {
            Settings = new JsonSerializerSettings
            {
                ReferenceLoopHandling = ReferenceLoopHandling.Error,
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                NullValueHandling = NullValueHandling.Ignore,
                Converters = new List<JsonConverter> { new StringEnumConverter() }
            };
        }

        public JsonSerializerSettings Settings { get; private set; }

        public override void ExecuteResult(ControllerContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context));
            if (this.JsonRequestBehavior == JsonRequestBehavior.DenyGet && string.Equals(context.HttpContext.Request.HttpMethod, "GET", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("JSON GET is not allowed");

            HttpResponseBase response = context.HttpContext.Response;
            response.ContentType = string.IsNullOrEmpty(this.ContentType) ? "application/json" : this.ContentType;

            if (this.ContentEncoding != null)
                response.ContentEncoding = this.ContentEncoding;
            if (this.Data == null)
                return;

            var scriptSerializer = JsonSerializer.Create(this.Settings);
            scriptSerializer.Serialize(response.Output, this.Data);
        }
    }
}