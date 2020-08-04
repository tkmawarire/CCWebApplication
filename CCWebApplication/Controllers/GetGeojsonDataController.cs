using System;
using System.Collections.Generic;
using System.Data.Entity.Spatial;
using System.Data.SqlTypes;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CCWebApplicationDAL.SystemEntities;
using GeoJSON.Net.Contrib.MsSqlSpatial;
using GeoJSON.Net.Feature;
using GeoJSON.Net.Geometry;
using Microsoft.SqlServer.Types;

namespace CCWebApplication.Controllers
{
    public class GetGeojsonDataController : Controller
    {
        //Model Name: GccSytemModel   Entities:GccSytemEntities
        private readonly GccSytemEntities _db = new GccSytemEntities();
        public ActionResult GetValves()
        {
            var valves = (from v in _db.watervalves select v);
            var pointList = new List<Feature>();
            foreach (var result in valves)
            {
                var geometry = new Point(new GeographicPosition(double.Parse(result.latitude.ToString()), double.Parse(result.longitude.ToString())));
                var properties = new Dictionary<string, object>
                {
                    {"feature", "valve" },
                    {"id", result.ID },
                    {"size", result.size }
                };
                var feature = new Feature(geometry, properties);
                pointList.Add(feature);
            }
            return Json(pointList, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetLeakages()
        {
            var leakages = (from l in _db.leakages select l);
            var pointList = new List<Feature>();
            foreach (var result in leakages)
            {
                var geometry = new Point(new GeographicPosition(double.Parse(result.Latitude.ToString()), double.Parse(result.Longitude.ToString())));
                var properties = new Dictionary<string, object>
                {
                    {"id", result.id },
                    {"source", result.Source }
                };
                var feature = new Feature(geometry, properties);
                pointList.Add(feature);
            }
            return Json(pointList, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetBulkMeters()
        {
            var bulkmeters = (from l in _db.bulkmeters select l);
            var pointList = new List<Feature>();
            foreach (var bulkmeter in bulkmeters)
            {
                var geometry = new Point(new GeographicPosition(double.Parse(bulkmeter.latitude.ToString()), double.Parse(bulkmeter.longitude.ToString())));
                var properties = new Dictionary<string, object>
                {
                    {"id", bulkmeter.ID }
                };
                var feature = new Feature(geometry, properties);
                pointList.Add(feature);
            }
            return Json(pointList, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetHydrants()
        {
            var hydrants = (from l in _db.hydrants select l);
            var pointList = new List<Feature>();
            foreach (var result in hydrants)
            {
                var geometry = new Point(new GeographicPosition(double.Parse(result.latitude.ToString()), double.Parse(result.longitude.ToString())));
                var properties = new Dictionary<string, object>
                {
                    {"id", result.ID },
                    {"height", result.Height }
                };
                var feature = new Feature(geometry, properties);
                pointList.Add(feature);
            }
            return Json(pointList, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetManholes()
        {
            var manholes = (from l in _db.manholes select l);
            var pointList = new List<Feature>();
            foreach (var result in manholes)
            {
                var geometry = new Point(new GeographicPosition(double.Parse(result.latitude.ToString()), double.Parse(result.longitude.ToString())));
                var properties = new Dictionary<string, object>
                {
                    {"id", result.ID },
                    {"height", result.Height}
                };
                var feature = new Feature(geometry, properties);
                pointList.Add(feature);
            }
            return Json(pointList, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetCities()
        {
            var zimcities = (from l in _db.zimcities select l);
            var polygonFeature = new List<Feature>();
            if (zimcities != null)
            {
                foreach (var results in zimcities)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry simplepolygon = SqlGeometry.Parse(new SqlString(results.geom.AsText()));
                        var simplepolygonGeometry = simplepolygon.ToGeoJSONObject<Polygon>();
                        var properties = new Dictionary<string, object>
                            {
                                {"id", results.ID },
                                {"province", results.CITY_NAME },
                                {"province_code", results.PROV_CODE },
                            };
                        var simplePolygonFeature = new Feature(simplepolygonGeometry, properties);
                        polygonFeature.Add(simplePolygonFeature);
                    }
                }
            }
            return Json(polygonFeature, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetTownships()
        {
            var townships = (from l in _db.zimtownships select l);
            var polygonFeature = new List<Feature>();
            if (townships != null)
            {
                foreach (var results in townships)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry simplepolygon = SqlGeometry.Parse(new SqlString(results.geom.AsText()));
                        var polygonGeometry = SqlGeometry.STPolyFromText(new SqlChars(results.geom.AsText()), 4326);
                        var simplepolygonGeometry = simplepolygon.ToGeoJSONObject<Polygon>();
                        var geojsonGeometry = polygonGeometry.ToGeoJSONObject<Polygon>();
                        var properties = new Dictionary<string, object>
                    {
                        {"id", results.id },
                        {"name", results.Name }

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
        public ActionResult GetStands()
        {
            var stands = (from s in _db.zimstands select s);
            var polygonFeature = new List<Feature>();
            if (stands != null)
            {
                foreach (var results in stands)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry geomCol = SqlGeometry.Parse(new SqlString(results.geom.AsText()));
                        var geojsongeom = geomCol.ToGeoJSONGeometry();
                        var properties = new Dictionary<string, object>
                            {
                                {"standid", results.standid },
                                {"standtype", results.townshipid }

                            };
                        var feature = new Feature(geojsongeom, properties);
                        polygonFeature.Add(feature);
                    }
                }
            }


            return Json(polygonFeature, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetWaterLines()
        {
            var stands = (from s in _db.wMainLines select s);
            var polygonFeature = new List<Feature>();
            if (stands != null)
            {
                foreach (var results in stands)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry geomCol = SqlGeometry.Parse(new SqlString(results.geom.AsText()));
                        var geojsongeom = geomCol.ToGeoJSONGeometry();
                        var properties = new Dictionary<string, object>
                            {
                                {"id", results.id },
                                {"size", results.Layer }

                            };
                        var feature = new Feature(geojsongeom, properties);
                        polygonFeature.Add(feature);
                    }
                }
            }


            return Json(polygonFeature, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetProperties()
        {
            var stands = (from s in _db.vwStands select s);
            var polygonFeature = new List<Feature>();
            if (stands != null)
            {
                foreach (var results in stands)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry geomCol = SqlGeometry.Parse(new SqlString(results.geom.AsText()));
                        var geojsongeom = geomCol.ToGeoJSONGeometry();
                        var properties = new Dictionary<string, object>
                                {
                                    {"accountName", results.ACCOUNT_NAME },
                                    {"accountNumber", results.ACC_NUMBER },
                                    {"meterNumber", results.METER_NUMBER },
                                    {"meterReading", results.READING },
                                    {"standId", results.STANDID },
                                    {"burstPipes", results.BURST_PIPES__ },
                                    {"waterSource", results.WATER_SOURCE },
                                    {"condition", results.CONDITION },
                                    { "popupContent", results.STANDID }

                                };
                        var feature = new Feature(geojsongeom, properties);
                        polygonFeature.Add(feature);
                    }
                }
            }
            return Json(polygonFeature, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetBoundedProperties()
        {
            //TODO: Bounds:29.804491996765133 -19.46889855721073,29.829189777374268 -19.46889855721073,29.829189777374268 -19.449900744498997, 29.804491996765133 -19.449900744498997, 29.804491996765133 -19.46889855721073
            var boundingbox = DbGeometry.PolygonFromText("POLYGON((29.749603271484375 -19.436323734711568,29.735355377197266 -19.45153962115835,29.762306213378906 -19.48390909855208,29.78427886962891 -19.469181787843308,29.749603271484375 -19.436323734711568))", 4326);
            var boundedStands = _db.zimstands.Where(s => s.geom.Intersects(boundingbox).Equals(true));
            var polygonFeature = new List<Feature>();
            if (boundedStands != null)
            {
                foreach (var results in boundedStands)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry geomCol = SqlGeometry.Parse(new SqlString(results.geom.AsText())).MakeValid();
                        var geojsongeom = geomCol.ToGeoJSONGeometry();
                        var properties = new Dictionary<string, object>
                            {
                                {"standid", results.standid },
                                {"standtype", results.townshipid }

                            };
                        var feature = new Feature(geojsongeom, properties);
                        polygonFeature.Add(feature);
                    }
                }
            }
            return Json(polygonFeature, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetProvinces()
        {
            var provinces = (from s in _db.zimprovinces select s);
            var polygonFeature = new List<Feature>();
            if (provinces != null)
            {
                foreach (var results in provinces)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry geomCol = SqlGeometry.Parse(new SqlString(results.geom.AsText()));
                        var geojsongeom = geomCol.ToGeoJSONGeometry();
                        var properties = new Dictionary<string, object>
                            {
                                {"province", results.PROVINCE },
                                {"province_code", results.PROV_CODE }

                            };
                        var feature = new Feature(geojsongeom, properties);
                        polygonFeature.Add(feature);
                    }
                }
            }


            return Json(polygonFeature, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetBoundsResult(string bbox)
        {
            var boundingbox = DbGeometry.PolygonFromText(bbox, 4326);
            var boundedStands = _db.zimstands.Where(s => s.geom.Intersects(boundingbox).Equals(true));
            var polygonFeature = new List<Feature>();
            if (boundedStands != null)
            {
                foreach (var results in boundedStands)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry geomCol = SqlGeometry.Parse(new SqlString(results.geom.AsText())).MakeValid();
                        var geojsongeom = geomCol.ToGeoJSONGeometry();
                        var properties = new Dictionary<string, object>
                            {
                                {"standid", results.standid },
                                {"standtype", results.townshipid }

                            };
                        var feature = new Feature(geojsongeom, properties);
                        polygonFeature.Add(feature);
                    }
                }
            }
            return Json(polygonFeature, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetBoundsFinance(string bbox)
        {
            var boundingbox = DbGeometry.PolygonFromText(bbox, 4326);
            var boundedStands = _db.vwAccountsMkobaMatches.Where(s => s.geom.Intersects(boundingbox).Equals(true));
            var polygonFeature = new List<Feature>();
            if (boundedStands != null)
            {
                foreach (var results in boundedStands)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry geomCol = SqlGeometry.Parse(new SqlString(results.geom.AsText())).MakeValid();
                        var geojsongeom = geomCol.ToGeoJSONGeometry();
                        var properties = new Dictionary<string, object>
                            {
                                {"account", results.Account },
                                {"currentpayment", results.CurrentPayment},
                                {"totalamntdue", results.TOTAL },
                                {"dept", results.Dept },
                                {"conscode", results.Cons_Code },
                                {"active", results.Active },
                                {"name", results.Name },
                                {"township", results.TOWNSHIPID },
                                {"standid", results.STANDID },
                                {"meternumber", results.METER_NUMBER },
                                {"reading", results.READING },
                                {"condition", results.CONDITION },
                                {"residents", results.RESIDENTS },
                                {"watersource", results.WATER_SOURCE },
                                {"illegalconnection", results.ILLEGAL_CONNECTION_ },
                                {"burstpipe", results.BURST_PIPES__ },
                                {"toiletseats", results.TOILET_SEATS_ }

                            };
                        var feature = new Feature(geojsongeom, properties);
                        polygonFeature.Add(feature);
                    }
                }
            }
            return Json(polygonFeature, JsonRequestBehavior.AllowGet);
        }
        //Some Finance Analytics
        public ActionResult GridCentroidCalculation()
        {
            var stands = (from s in _db.zimstands select s);
            var polygonFeature = new List<Feature>();
            if (stands != null)
            {
                foreach (var results in stands)
                {
                    if (results.geom != null)
                    {
                        SqlGeometry geomCol = SqlGeometry.Parse(new SqlString(results.geom.AsText()));
                        var geojsongeom = geomCol.ToGeoJSONGeometry();
                        SqlGeometry envelope = SqlGeometry.Parse(new SqlString(results.geom.AsText())).MakeValid().STEnvelope();
                        SqlGeometry centroid = envelope.STCentroid();
                        double avgx = (double) centroid.STX;
                        double avgy = (double) centroid.STY;
                        var properties = new Dictionary<string, object>
                            {
                                {"standid", results.standid },
                                {"standtype", results.townshipid },
                                {"latitude", avgy },
                                {"longitude", avgx }

                            };
                        var feature = new Feature(geojsongeom, properties);
                        polygonFeature.Add(feature);
                    }
                }
            }


            return Json(polygonFeature, JsonRequestBehavior.AllowGet);
        }

    }
}