using System;
using System.Collections.Generic;
using System.Data.SqlTypes;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CCWebApplicationDAL.SystemEntities;
using CCWebApplicationDAL.WaterAuditEntities;
using GeoJSON.Net.Contrib.MsSqlSpatial;
using GeoJSON.Net.Feature;
using GeoJSON.Net.Geometry;
using Microsoft.SqlServer.Types;

namespace CCWebApplication.Controllers
{
    public class CascadingDropdownController : Controller
    {
        //Model Name: GccSytemModel   Entities:GccSytemEntities
        private readonly GccSytemEntities _db = new GccSytemEntities();
        // GET: CascadingDropdown
        public JsonResult GetCascadeProvinces()
        {
            var db = new GccSytemEntities();
            return Json(db.zimprovinces.Select(c => new { ProvinceCode = c.PROV_CODE, ProvinceName = c.PROVINCE }),
                JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetCascadeCities(int provinces)
        {
            var db = new GccSytemEntities();
            var cities = db.zimcities.AsQueryable();

            if (provinces != null)
            {
                cities = cities.Where(p => p.PROV_CODE == provinces);
            }
            return Json(cities.Select(p => new { CityID = p.CITY_ID, CityName = p.CITY_NAME }), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetCascadeTownships(int cities)
        {
            var db = new GccSytemEntities();
            var townships = db.zimtownships.AsQueryable();

            if (cities != null)
            {
                townships = townships.Where(t => t.cityid == cities);
            }
            return Json(townships.Select(t => new { TownshipID = t.id, TownshipName = t.Name }),
                JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetSelectedProvince(int id)
        {
            var db = new GccSytemEntities();
            var polygons = db.zimprovinces.Where(p => p.PROV_CODE == id);
            var polygonFeature = new List<Feature>();
            if (polygons != null)
            {
                foreach (var results in polygons)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry simplepolygon = SqlGeometry.Parse(new SqlString(results.geom.AsText()));
                        var polygonGeometry = SqlGeometry.STPolyFromText(new SqlChars(results.geom.AsText()), 4326);
                        var simplepolygonGeometry = simplepolygon.ToGeoJSONObject<Polygon>();
                        var geojsonGeometry = polygonGeometry.ToGeoJSONObject<Polygon>();
                        var properties = new Dictionary<string, object>
                    {
                        {"id", results.ID },
                        {"province", results.PROVINCE },
                        {"province_code", results.PROV_CODE },

                    };
                        var feature = new Feature(geojsonGeometry, properties);
                        var simplePolygonFeature = new Feature(simplepolygonGeometry, properties);
                        //polygonFeature.Add(feature);
                        polygonFeature.Add(simplePolygonFeature);
                    }
                }
            }
            return Json(polygonFeature, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetSelectedCity(int id)
        {
            var db = new GccSytemEntities();
            var polygons = db.zimcities.Where(p => p.CITY_ID == id);
            var polygonFeature = new List<Feature>();
            if (polygons != null)
            {
                foreach (var results in polygons)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry simplepolygon = SqlGeometry.Parse(new SqlString(results.geom.AsText()));
                        var polygonGeometry = SqlGeometry.STPolyFromText(new SqlChars(results.geom.AsText()), 4326);
                        var simplepolygonGeometry = simplepolygon.ToGeoJSONObject<Polygon>();
                        var geojsonGeometry = polygonGeometry.ToGeoJSONObject<Polygon>();
                        var properties = new Dictionary<string, object>
                    {
                        {"id", results.CITY_NAME },
                        {"province", results.PROVINCE },
                        {"province_code", results.PROV_CODE },

                    };
                        var feature = new Feature(geojsonGeometry, properties);
                        var simplePolygonFeature = new Feature(simplepolygonGeometry, properties);
                        //polygonFeature.Add(feature);
                        polygonFeature.Add(simplePolygonFeature);
                    }
                }
            }
            return Json(polygonFeature, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetSelectedTown(int id)
        {
            var db = new GccSytemEntities();
            var polygons = db.zimtownships.Where(p => p.id == id);
            var polygonFeature = new List<Feature>();
            if (polygons != null)
            {
                foreach (var results in polygons)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry simplepolygon = SqlGeometry.Parse(new SqlString(results.geom.AsText()));
                        var polygonGeometry = SqlGeometry.STPolyFromText(new SqlChars(results.geom.AsText()), 4326);
                        var simplepolygonGeometry = simplepolygon.ToGeoJSONObject<Polygon>();
                        var geojsonGeometry = polygonGeometry.ToGeoJSONObject<Polygon>();
                        var properties = new Dictionary<string, object>
                    {
                        {"id", results.Name }

                    };
                        var feature = new Feature(geojsonGeometry, properties);
                        var simplePolygonFeature = new Feature(simplepolygonGeometry, properties);
                        polygonFeature.Add(simplePolygonFeature);
                    }
                }
            }
            return Json(polygonFeature, JsonRequestBehavior.AllowGet);
        }
    }
}