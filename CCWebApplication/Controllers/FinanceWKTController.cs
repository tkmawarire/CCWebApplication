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
    public class FinanceWKTController : Controller
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

    public class vwZimStandsWKTsController : ApiController
    {
        private GccSytemEntities db = new GccSytemEntities();

        public DataSourceResult GetvwZimStandsWKTs([System.Web.Http.ModelBinding.ModelBinder(typeof(WebApiDataSourceRequestModelBinder))]DataSourceRequest request)
        {
            return db.vwZimStandsWKTs.ToDataSourceResult(request);
        }

        public vwZimStandsWKT GetvwZimStandsWKT(int id)
        {
            vwZimStandsWKT vwZimStandsWKT = db.vwZimStandsWKTs.Find(id);
            if(vwZimStandsWKT == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return vwZimStandsWKT;
        }




        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}