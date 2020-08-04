﻿using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using Kendo.Mvc.UI;
using Kendo.Mvc.Extensions;
using CCWebApplicationDAL.SystemEntities;

namespace CCWebApplication.Controllers
{
    public class FinanceFxdGridController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Excel_Export_Save(string contentType, string base64, string fileName)
        {
            var fileContents = Convert.FromBase64String(base64);

            return File(fileContents, contentType, fileName);
        }


        public ActionResult Pdf_Export_Save(string contentType, string base64, string fileName)
        {
            var fileContents = Convert.FromBase64String(base64);

            return File(fileContents, contentType, fileName);
        }
    }

    public class vwFinanceGridCoordinatesController : ApiController
    {
        private GccSytemEntities db = new GccSytemEntities();

        public DataSourceResult GetvwFinanceGridCoordinates([System.Web.Http.ModelBinding.ModelBinder(typeof(WebApiDataSourceRequestModelBinder))]DataSourceRequest request)
        {
            return db.vwFinanceGridCoordinates.ToDataSourceResult(request);
        }

        public vwFinanceGridCoordinate GetvwFinanceGridCoordinate(int id)
        {
            vwFinanceGridCoordinate vwFinanceGridCoordinate = db.vwFinanceGridCoordinates.Find(id);
            if(vwFinanceGridCoordinate == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return vwFinanceGridCoordinate;
        }




        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}