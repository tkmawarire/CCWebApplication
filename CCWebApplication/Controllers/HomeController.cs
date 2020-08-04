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
    public class HomeController : Controller
    {
        private readonly WaterAuditEntities _db = new WaterAuditEntities();
        private readonly GccSytemEntities db = new GccSytemEntities();
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult WaterReticulation()
        {
            return View();
        }
        //TODO:Get Data
        [HttpGet]
        public ActionResult wWindsorPark()
        {
            var polygons = (from w in _db.wWindsorParks select w);
            var polygonFeature = new List<Feature>();
            if (polygons != null)
            {
                foreach (var results in polygons)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry simplepolygon = SqlGeometry.Parse(new SqlString(results.geom.AsText()));
                        var simplepolygonGeometry = simplepolygon.ToGeoJSONObject<Polygon>();
                        var properties = new Dictionary<string, object>
                            {
                                {"standid", results.standid },
                                {"objectid", results.id },
                            };
                        var simplePolygonFeature = new Feature(simplepolygonGeometry, properties);
                        polygonFeature.Add(simplePolygonFeature);
                    }
                }
            }
            return Json(polygonFeature, JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public ActionResult wMainLine()
        {
            var lines = (from l in db.wMainLines select l);
            var lineFeature = new List<Feature>();
            if (lines != null)
            {
                foreach (var results in lines)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry simplelineGeometry = SqlGeometry.Parse(new SqlString(results.geom.AsText()));
                        var lineGeometry = SqlGeometry.STLineFromText(new SqlChars(results.geom.AsText()), 4326);
                        var geom = simplelineGeometry.ToGeoJSONObject<LineString>();
                        var linegeom = lineGeometry.ToGeoJSONObject<LineString>();

                        var properties = new Dictionary<string, object>
                            {
                                {"id", results.id }
                            };
                        var features = new Feature(geom, properties);
                        var feature = new Feature(linegeom, properties);
                        //TODO: Add to Array
                        lineFeature.Add(feature);
                    }
                }
            }
            return Json(lineFeature, JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public ActionResult wLiteralLine()
        {
            var lines = (from l in _db.wLiteralLines select l);
            var lineFeature = new List<Feature>();
            if (lines != null)
            {
                foreach (var results in lines)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry simplelineGeometry = SqlGeometry.Parse(new SqlString(results.geom.AsText()));
                        var lineGeometry = SqlGeometry.STLineFromText(new SqlChars(results.geom.AsText()), 4326);
                        var geom = simplelineGeometry.ToGeoJSONObject<LineString>();
                        var linegeom = lineGeometry.ToGeoJSONObject<LineString>();
                        var properties = new Dictionary<string, object>
                            {
                                { "id", results.id } ,
                                { "accHolder", results.AccHolder },
                                { "activeFalg", results.ActiveFlag },
                                { "diameter", results.Diameter },
                                { "enabled", results.Enabled },
                                { "installDate", results.InstalDate },
                                { "material", results.Material },
                                { "serviceType", results.ServiceTyp },
                                { "lineType", results.LineType }
                            };
                        var features = new Feature(geom, properties);
                        var feature = new Feature(linegeom, properties);
                        //TODO: Add to Array
                        lineFeature.Add(feature);
                    }
                }
            }
            return Json(lineFeature, JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public ActionResult wHydrants()
        {
            var hydrants = (from v in _db.wHydrants select v);
            var pointList = new List<Feature>();
            foreach (var result in hydrants)
            {
                var geometry = new Point(new GeographicPosition(double.Parse(result.lat.ToString()), double.Parse(result.@long.ToString())));
                var properties = new Dictionary<string, object>
                {
                    {"feature", "hydrant"},
                    {"id", result.id }
                };
                var feature = new Feature(geometry, properties);
                pointList.Add(feature);
            }
            return Json(pointList, JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public ActionResult wValves()
        {
            var valves = (from v in _db.wValves select v);
            var pointList = new List<Feature>();
            foreach (var result in valves)
            {
                var geometry = new Point(new GeographicPosition(double.Parse(result.latitude.ToString()), double.Parse(result.longitude.ToString())));
                var properties = new Dictionary<string, object>
                {
                    {"feature", "valves"},
                    {"id", result.id },
                    {"size", result.size},
                };
                var feature = new Feature(geometry, properties);
                pointList.Add(feature);
            }
            return Json(pointList, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult wServiceConnection()
        {
            var serviceConn = (from s in _db.wServiceConnections select s);
            var pointList = new List<Feature>();
            foreach (var result in serviceConn)
            {
                var geometry = new Point(new GeographicPosition(double.Parse(result.lat.ToString()), double.Parse(result.@long.ToString())));
                var geom = new Polygon(new List<LineString>());
                var properties = new Dictionary<string, object>
                {
                    {"feature", "Service Connections"},
                    {"id", result.id },
                    {"accHolder", result.AccHolder},
                    {"activeFlag", result.ActiveFlag},
                    {"accNumber", result.AccNumber},
                    {"enabled", result.Enabled},
                    {"managedBy", result.ManagedBy},
                    {"meterNumb", result.MeterNumb},
                    {"ownedBy", result.OwnedBy},
                    {"standId", result.standid}
                };
                var feature = new Feature(geometry, properties);
                pointList.Add(feature);
            }
            return Json(pointList, JsonRequestBehavior.AllowGet);
        }
        public ActionResult WStands2ValvesResult(int valveid)
        {
            //var unassigned = _db.vwStands2Valves.Where(c => c.valveId.Equals(fromateria));
            var polygons = (from w in _db.vwStands2Valves where w.valveId == valveid select w);
            var polygonFeature = new List<Feature>();
            if (polygons != null)
            {
                foreach (var results in polygons)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry simplepolygon = SqlGeometry.Parse(new SqlString(results.geom.AsText()));
                        var simplepolygonGeometry = simplepolygon.ToGeoJSONObject<Polygon>();
                        var properties = new Dictionary<string, object>
                            {
                                {"standid", results.standid },
                                {"activeFlag", results.ActiveFlag },
                                {"enabled", results.Enabled },
                                {"managed", results.ManagedBy },
                                {"accNumber", results.AccNumber },
                                {"accHolder", results.AccHolder },
                                {"serviceType", results.ServiceTyp },
                                {"meterNumber", results.MeterNumb },
                                {"atterialMaterial", results.Material },
                                {"meterInstallDate", results.InstalDate },
                                {"mainLineId", results.Max_Id },
                            };
                        var simplePolygonFeature = new Feature(simplepolygonGeometry, properties);
                        polygonFeature.Add(simplePolygonFeature);
                    }
                }
            }
            return Json(polygonFeature, JsonRequestBehavior.AllowGet);
        }
        public ActionResult vwAffectedHousing(string pipeid)
        {
            var polygons = (from w in _db.vwAffectedHouses where w.pipeid.Equals(pipeid) select w);
            var polygonFeature = new List<Feature>();
            if (polygons != null)
            {
                foreach (var results in polygons)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry simplepolygon = SqlGeometry.Parse(new SqlString(results.geom.AsText()));
                        var simplepolygonGeometry = simplepolygon.ToGeoJSONObject<Polygon>();
                        var properties = new Dictionary<string, object>
                            {
                                {"standid", results.standid },
                                {"pipeid", results.pipeid },
                                {"cityid", results.cityid },
                                {"standtype", results.standtype },
                                {"townshipid", results.townshipid }
                            };
                        var simplePolygonFeature = new Feature(simplepolygonGeometry, properties);
                        polygonFeature.Add(simplePolygonFeature);
                    }
                }
            }
            return Json(polygonFeature, JsonRequestBehavior.AllowGet);
        }

    }
}