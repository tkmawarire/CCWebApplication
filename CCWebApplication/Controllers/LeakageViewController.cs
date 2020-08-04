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
    public class LeakageViewController : Controller
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

    public class vwleakageTownsController : ApiController
    {
        private GccSytemEntities db = new GccSytemEntities();

        public DataSourceResult GetvwleakageTowns([System.Web.Http.ModelBinding.ModelBinder(typeof(WebApiDataSourceRequestModelBinder))]DataSourceRequest request)
        {
            return db.vwleakageTowns.ToDataSourceResult(request);
        }

        public vwleakageTown GetvwleakageTown(int id)
        {
            vwleakageTown vwleakageTown = db.vwleakageTowns.Find(id);
            if(vwleakageTown == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return vwleakageTown;
        }

        public HttpResponseMessage PutvwleakageTown(int id, vwleakageTown vwleakageTown)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != vwleakageTown.id)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            try
            {
                db.Entry(vwleakageTown).State = EntityState.Modified;
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }



        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}