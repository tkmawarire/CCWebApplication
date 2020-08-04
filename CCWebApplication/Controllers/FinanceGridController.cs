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
    public class FinanceGridController : Controller
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

    public class vwMkobaMatchingGridsController : ApiController
    {
        private GccSytemEntities db = new GccSytemEntities();

        public DataSourceResult GetvwMkobaMatchingGrids([System.Web.Http.ModelBinding.ModelBinder(typeof(WebApiDataSourceRequestModelBinder))]DataSourceRequest request)
        {
            return db.vwMkobaMatchingGrids.ToDataSourceResult(request);
        }

        public vwMkobaMatchingGrid GetvwMkobaMatchingGrid(int id)
        {
            vwMkobaMatchingGrid vwMkobaMatchingGrid = db.vwMkobaMatchingGrids.Find(id);
            if(vwMkobaMatchingGrid == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return vwMkobaMatchingGrid;
        }




        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}