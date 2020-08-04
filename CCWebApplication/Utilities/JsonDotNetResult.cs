using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;

namespace CCWebApplication.Utilities
{
    public class JsonDotNetResult : ActionResult
    {
        private readonly object _responseBody;

        public JsonDotNetResult()
        {
        }

        public JsonDotNetResult(object responseBody)
        {
            ResponseBody = responseBody;
        }

        public JsonDotNetResult(object responseBody, JsonSerializerSettings settings)
        {
            _responseBody = responseBody;
            Settings = settings;
        }

        /// <summary>Gets or sets the serialiser settings</summary> 
        public JsonSerializerSettings Settings { get; set; }

        /// <summary>Gets or sets the encoding of the response</summary> 
        public Encoding ContentEncoding { get; set; }

        /// <summary>Gets or sets the content type for the response</summary> 
        public string ContentType { get; set; }

        /// <summary>Gets or sets the body of the response</summary> 
        public object ResponseBody { get; set; }

        /// <summary>Gets the formatting types depending on whether we are in debug mode</summary> 
        private static Formatting Formatting => Debugger.IsAttached ? Formatting.Indented : Formatting.None;

        /// <summary> 
        /// Serialises the response and writes it out to the response object 
        /// </summary> 
        /// <param name="context">The execution context</param> 
        public override void ExecuteResult(ControllerContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            var response = context.HttpContext.Response;

            // set content type 
            response.ContentType = !string.IsNullOrEmpty(ContentType) ? ContentType : "application/json";

            // set content encoding 
            if (ContentEncoding != null)
            {
                response.ContentEncoding = ContentEncoding;
            }

            if (ResponseBody != null)
            {
                response.Write(JsonConvert.SerializeObject(ResponseBody, Formatting, Settings));
            }
        }
    }
}