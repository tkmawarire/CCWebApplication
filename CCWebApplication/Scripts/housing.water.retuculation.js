L.ImageOverlay.include({
    getBounds: function () {
        return this._bounds;
    }
});
var map = L.map("map", {
    zoomControl:false,
    maxZoom: 24
}).fitBounds([[-19.4627479975, 29.8348333722], [-19.458693015, 29.843062182]]);
var hash = new L.Hash(map);
var additional_attrib = 'created f. <a href="http://localhost:49408/Home/Index" target ="_blank">GCC</a> by <a href="https://gisconsult/" target ="_blank">GISKonsult</a> & <a href="https://github.com/Tashaa78" target ="_blank">Contributors</a><br>';
var feature_group = new L.featureGroup([]);
var raster_group = new L.LayerGroup([]);
var windsorLayer = new L.geoJson([]);
var wMainLineLayer = new L.geoJson([]);
var wLiteralLineLayer = new L.geoJson([]);
var wHydrantsLayer = new L.geoJson([]);
var wValvesLayer = new L.geoJson([]);
var wServiceConnectionLayer = new L.geoJson([]);
var affectedHousesLayer = new L.geoJson([]);
var wAffectedHouses = new L.geoJson([]);
var layersArray = new Array();
var layerOrder = new Array();
var osm = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: additional_attrib + '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
});
osm.addTo(map);
var sidebar = L.control.sidebar("sidebar").addTo(map);
var zoomBoxControl = L.control.zoomBox({
    modal: true, // If false (default), it deactivates after each use.
    position: "bottomright"
    // className: "customClass"  // Class to use to provide icon instead of Font Awesome
});
map.addControl(zoomBoxControl);
var zoomcontrol = L.control.zoom({
    position: "bottomright"
});
map.addControl(zoomcontrol);
L.control.locate({
    position: "bottomright", // set the location of the control
    layer: new L.LayerGroup(), // use your own layer for the location marker
    drawCircle: true, // controls whether a circle is drawn that shows the uncertainty about the location
    follow: true, // follow the user's location
    setView: true, // automatically sets the map view to the user's location, enabled if `follow` is true
    keepCurrentZoomLevel: false, // keep the current map zoom level when displaying the user's location. (if `false`, use maxZoom)
    stopFollowingOnDrag: false, // stop following when the map is dragged if `follow` is true (deprecated, see below)
    remainActive: false, // if true locate control remains active on click even if the user's location is in view.
    markerClass: L.circleMarker, // L.circleMarker or L.marker
    circleStyle: {}, // change the style of the circle around the user's location
    markerStyle: {},
    followCircleStyle: {}, // set difference for the style of the circle around the user's location while following
    followMarkerStyle: {},
    icon: "fa fa-map-marker", // class for icon, fa-location-arrow or fa-map-marker
    iconLoading: "fa fa-spinner fa-spin", // class for loading icon
    circlePadding: [0, 0], // padding around accuracy circle, value is passed to setBounds
    metric: true, // use metric or imperial units
    onLocationError: function (err) {
        alert(err.message)
    }, // define an error callback function
    onLocationOutsideMapBounds: function (context) { // called when outside map boundaries
        alert(context.options.strings.outsideMapBoundsMsg);
    },
    showPopup: true, // display a popup when the user click on the inner marker
    strings: {
        title: "Show me where I am", // title of the locate control
        metersUnit: "meters", // string for metric units
        feetUnit: "feet", // string for imperial units
        popup: "You are within {distance} {unit} from this point", // text to appear if user clicks on circle
        outsideMapBoundsMsg: "You seem located outside the boundaries of the map" // default message for onLocationOutsideMapBounds
    },
    locateOptions: {
        enableHighAccuracy: true,
        maxZoom: 10
    } // define location options e.g enableHighAccuracy: true or maxZoom: 10
}).addTo(map);
var navbar = new L.control.Navbar({
    position: "bottomright",
    center: [-19.4584, 29.8120],
    zoom: 16
}).addTo(map);
L.easyPrint({
    title: "My awesome print button",
    //elementsToHide: 'p, h2, .gitButton',
    position: "bottomright"
}).addTo(map);
// https: also suppported.
var esriWorldImagery = L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxZoom: 28
});
var mapQuestOpenAerial = L.tileLayer("http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}", {
    type: "sat",
    ext: "jpg",
    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency',
    subdomains: "1234"
});
// https: also suppported.
var esriWorldStreetMap = L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
});
//TODO: 
var sidebarmini = L.control.markersidebar("sidebar_mini", {
    closeButton: true,
    position: "left"
});
//TODO:
var sidebarminipipe = L.control.markersidebar("sidebar_pipe", {
    closeButton: true,
    position: "right"
});
map.addControl(sidebarmini);
map.addControl(sidebarminipipe);
var onEachFeature = function (feature, layer) {
    feature.layer = layer;
    (function (layer, properties) {
        layer.on("click", function (e) {
            $("#myonoffswitch1").prop("checked", true);
            if (map.hasLayer(wAffectedHouses)) {
                console.log("Map Layer Windsor Park is present");
                map.removeLayer(wAffectedHouses);
                if (map.hasLayer(affectedHousesLayer)) {
                    map.removeLayer(affectedHousesLayer);
                }
            } 
            var valveid = properties.valveid;
            var valvesize = properties.size;
            var tomainline = properties.toaterial;
            var fromaterial = properties.fromateria;
            $("#valveid").attr("value", valveid);
            $("#valvesize").attr("value", valvesize);
            $("#tomainline").attr("value", tomainline);
            $("#fromaterial").attr("value", fromaterial);
            $("#myonoffswitch1").change(function () {
                if (this.checked) {
                    //Do stuff
                    console.log("myonoffswitch1 is OPEN");
                } else {
                    console.log("myonoffswitch1 is closed");
                    $.getJSON(window.wStands2ValvesResult + "?valveid=" + valveid, function (wWindsorParkArray1) {
                        var windsorJson1 = {
                            "type": "FeatureCollection",
                            "features": wWindsorParkArray1
                        };
                        var windsorGeoJson1 = (windsorJson1);

                        console.log(windsorGeoJson1);

                        function popWWindsorPark(feature1, layer1) {
                            var popupContent = '<table><tr><th scope="row">Stand ID: </th><td>' + Autolinker.link(String(feature1.properties["standid"])) + '</td></tr><tr><th scope="row">Active Flag: </th><td>' + Autolinker.link(String(feature1.properties["activeFlag"])) + '</td></tr><tr><th scope="row">Enabled: </th><td>' + Autolinker.link(String(feature1.properties["enabled"])) + '</td></tr><tr><th scope="row">Managed By: </th><td>' + Autolinker.link(String(feature1.properties["managed"])) + '</td></tr><tr><th scope="row">Account Number</th><td>' + Autolinker.link(String(feature1.properties["accNumber"])) + '</td></tr><tr><th scope="row">Account Holder</th><td>' + Autolinker.link(String(feature1.properties["accHolder"])) + '</td></tr><tr><th scope="row">Service Type</th><td>' + Autolinker.link(String(feature1.properties["serviceType"])) + '</td></tr><tr><th scope="row">Meter Number</th><td>' + Autolinker.link(String(feature1.properties["meterNumber"])) + '</td></tr><tr><th scope="row">Meter Install Date: </th><td>' + Autolinker.link(String(feature1.properties["meterInstallDate"])) + '</td></tr><tr><th scope="row">Main Line ID: </th><td>' + Autolinker.link(String(feature1.properties["mainLineId"])) + '</td></tr><tr><th scope="row">Aterial Material: </th><td>' + Autolinker.link(String(feature1.properties["atterialMaterial"])) + "</td></tr></table>";
                            layer1.bindPopup(popupContent);
                        }

                        function doStylewWindsorPark(feature2) {
                            return {
                                color: "#000000",
                                fillColor: "#ff0000",
                                weight: 0.2,
                                dashArray: "",
                                opacity: 1.0,
                                fillOpacity: 1.0
                            };
                        }

                        wAffectedHouses = new L.geoJson(windsorGeoJson1, {
                            onEachFeature: popWWindsorPark,
                            style: doStylewWindsorPark
                        });
                        wAffectedHouses.addTo(map);
                    });
                }
            });
            sidebarmini.show();
            console.log(tomainline, fromaterial);
                if ($("#myonoffswitch1").prop("checked") === true) {
                    console.log("myonoffswitch1 is open");
                } else {
                    console.log("myonoffswitch1 is closed");
                }  
        });
        layer.on("mouseout", function (e) {
        });
    })(layer, feature.properties);
};
//TODO:
var onEachFeatureMainLine = function (feature, layer) {
    feature.layer = layer;
    (function (layer, properties) {
        layer.on("click", function (e) {
            $("#myonoffswitch").prop("checked", true);
            if(map.hasLayer(wAffectedHouses && affectedHousesLayer)){
                console.log("map has layer windsor park");
                map.removeLayer(wAffectedHouses);
                map.removeLayer(affectedHousesLayer);
                //cleanup the layers                
            }
            var pipeid = properties.id;
            var pipesize = properties.size;
            var tovalveid = properties.toaterial;
            var fromvalveid = properties.fromateria;
            $("#pipeid").attr("value", pipeid);
            $("#pipesize").attr("value", pipesize);
            $("#tovalveid").attr("value", tovalveid);
            $("#fromvalveid").attr("value", fromvalveid);
            $("#myonoffswitch").change(function () {
                if (this.checked) {
                    console.log("myonoffswitch1 is open");
                } else {
                    console.log("myonoffswitch is closed");
                    $.getJSON(window.vwAffectedHouses + "?pipeid=" + pipeid, function (wAffectedHousesArray) {
                        var affectedHousesJson = {
                            "type": "FeatureCollection",
                            "features": wAffectedHousesArray
                        };
                        var affectedHousesGeoJson = (affectedHousesJson);
                        console.log(affectedHousesGeoJson);
                        function popWWindsorPark(feature1, layer1) {
                            var popupContent = '<table><tr><th scope="row">Stand ID: </th><td>' + Autolinker.link(String(feature1.properties["standid"])) + '</td></tr><tr><th scope="row">Pipe ID: </th><td>' + Autolinker.link(String(feature1.properties["pipeid"])) + '</td></tr><tr><th scope="row">Stand Type: </th><td>' + Autolinker.link(String(feature1.properties["standtype"])) + '</td></tr><tr><th scope="row">Township ID: </th><td>' + Autolinker.link(String(feature1.properties["townshipid"])) + '</td></tr><tr><th scope="row">Account Number</th><td>' + Autolinker.link(String(feature1.properties["standid"])) + '</td></tr><tr><th scope="row">Account Holder</th><td>' + Autolinker.link(String(feature1.properties["accHolder"])) + '</td></tr><tr><th scope="row">Service Type</th><td>' + Autolinker.link(String(feature1.properties["serviceType"])) + '</td></tr><tr><th scope="row">Meter Number</th><td>' + Autolinker.link(String(feature1.properties["meterNumber"])) + '</td></tr><tr><th scope="row">Meter Install Date: </th><td>' + Autolinker.link(String(feature1.properties["meterInstallDate"])) + '</td></tr><tr><th scope="row">Main Line ID: </th><td>' + Autolinker.link(String(feature1.properties["pipeid"])) + '</td></tr><tr><th scope="row">Aterial Material: </th><td>' + Autolinker.link(String(feature1.properties["atterialMaterial"])) + "</td></tr></table>";
                            layer1.bindPopup(popupContent);
                        }
                        function doStylewWindsorPark(feature2) {
                            return {
                                color: "#000000",
                                fillColor: "#ff0000",
                                weight: 0.2,
                                dashArray: "",
                                opacity: 1.0,
                                fillOpacity: 1.0
                            };
                        }
                        affectedHousesLayer = new L.geoJson(affectedHousesGeoJson, {
                            onEachFeature: popWWindsorPark,
                            style: doStylewWindsorPark
                        });
                        affectedHousesLayer.addTo(map);
                    });
                }
            });
            sidebarminipipe.show();
            if ($("#myonoffswitch").prop("checked") === true) {
                console.log("myonoffswitch1 is open");
                if (map.hasLayer(wAffectedHouses && affectedHousesLayer)) {
                    console.log("map has layer windsor park");
                    map.removeLayer(wAffectedHouses);
                    map.removeLayer(affectedHousesLayer);
                    //Clear the layers of all data//
                }
            }
            else {
                console.log("myonoffswitch is closed");
            }
        });
        layer.on("mouseout", function (e) {
            if (map.hasLayer(wAffectedHouses && affectedHousesLayer)) {
                console.log("map has layer windsor park");
                map.removeLayer(wAffectedHouses);
                map.removeLayer(affectedHousesLayer);
                //Clear the layers of all data//
            }
        });
    })(layer, feature.properties);
};
//TODO:
$.getJSON(wMainLine, function (wMainLineArray) {
    var wMainLineJson = {
        "type": "FeatureCollection",
        "features": wMainLineArray
    };
    var wMainLineGeoJson = (wMainLineJson);

    console.log(wMainLineGeoJson);

    function popWMainLine(feature, layer) {
        var popupContent = '<table><tr><th scope="row">Id</th><td>' + Autolinker.link(String(feature.properties["Id"])) + "</td></tr></table>";
        layer.bindPopup(popupContent);
    }
    function doStylewMainLine(feature) {
        return {
            weight: 7.3,
            color: "#c0dfff",
            dashArray: "",
            opacity: 1.0,
            fillOpacity: 1.0
        };
    }

    wMainLineLayer = L.geoJson(wMainLineGeoJson, {
        onEachFeature: onEachFeatureMainLine,
        style: doStylewMainLine
    });

    layerOrder[layerOrder.length] = wMainLineLayer;

    for (var index = 0; index < layerOrder.length; index++) {
        feature_group.removeLayer(layerOrder[index]);
        feature_group.addLayer(layerOrder[index]);
    }
    //add comment sign to hide this layer on the map in the initial view.
    feature_group.addLayer(wMainLineLayer);
});
//TODO:
$.getJSON(wWindsorPark, function (wWindsorParkArray) {
    var windsorJson = {
        "type": "FeatureCollection",
        "features": wWindsorParkArray
    };
    var windsorGeoJson = (windsorJson);

    console.log(windsorGeoJson);

    function popWWindsorPark(feature, layer) {
        var popupContent = '<table><tr><th scope="row">Feature ID: </th><td>' + Autolinker.link(String(feature.properties["objectid"])) + '</td></tr><tr><th scope="row">Stand Number: </th><td>' + Autolinker.link(String(feature.properties["standid"])) + "</td></tr></table>";
        layer.bindPopup(popupContent);
    }

    function doStylewWindsorPark(feature) {
        return {
            color: "#000000",
            fillColor: "#babfc9",
            weight: 0.2,
            dashArray: "",
            opacity: 1.0,
            fillOpacity: 1.0
        };
    }

    windsorLayer = new L.geoJson(windsorGeoJson, {
        onEachFeature: popWWindsorPark,
        style: doStylewWindsorPark
    });

    layerOrder[layerOrder.length] = windsorLayer;

    for (var index = 0; index < layerOrder.length; index++) {
        feature_group.removeLayer(layerOrder[index]);
        feature_group.addLayer(layerOrder[index]);
    }
    //add comment sign to hide this layer on the map in the initial view.
    feature_group.addLayer(windsorLayer);
});
//TODO:
$.getJSON(wLiteralLine, function (wLiteralLineArray) {
    var wLiteralLineJson = {
        "type": "FeatureCollection",
        "features": wLiteralLineArray
    };
    var wLiteralLineGeoJson = (wLiteralLineJson);

    console.log(wLiteralLineGeoJson);

    function popWLiteralLine(feature, layer) {
        var popupContent = '<table><tr><th scope="row">ID:</th><td>' + Autolinker.link(String(feature.properties["id"])) + '</td></tr><tr><th scope="row">Account Holder: </th><td>' + Autolinker.link(String(feature.properties["accHolder"])) + '</td></tr><tr><th scope="row">Main Connection: </th><td>' + Autolinker.link(String(feature.properties["maxid"])) + '</td></tr><tr><th scope="row">Active Flag</th><td>' + Autolinker.link(String(feature.properties["activeFalg"])) + '</td></tr><tr><th scope="row">Diameter: </th><td>' + Autolinker.link(String(feature.properties["diameter"])) + '</td></tr><tr><th scope="row">Enabled: </th><td>' + Autolinker.link(String(feature.properties["enabled"])) + '</td></tr><tr><th scope="row">Line Type</th><td>' + Autolinker.link(String(feature.properties["lineType"])) + '</td></tr><tr><th scope="row">Material</th><td>' + Autolinker.link(String(feature.properties["material"])) + '</td></tr><tr><th scope="row">Facility ID</th><td>' + Autolinker.link(String(feature.properties["facilityId"])) + '</td></tr><tr><th scope="row">Install Date: </th><td>' + Autolinker.link(String(feature.properties["installDate"])) + '</td></tr><tr><th scope="row">Material</th><td>' + Autolinker.link(String(feature.properties["material"])) + '</td></tr><tr><th scope="row">Service Type: </th><td>' + Autolinker.link(String(feature.properties["serviceType"])) + "</td></tr></table>";
        layer.bindPopup(popupContent);
    }
    function doStylewLiteralLine(feature) {
        return {
            weight: 2.3,
            color: "#c0dfff",
            dashArray: "",
            opacity: 1.0,
            fillOpacity: 1.0
        };
    }

    wLiteralLineLayer = new L.geoJson(wLiteralLineGeoJson, {
        onEachFeature: popWLiteralLine,
        style: doStylewLiteralLine
    });

    layerOrder[layerOrder.length] = wLiteralLineLayer;

    for (var index = 0; index < layerOrder.length; index++) {
        feature_group.removeLayer(layerOrder[index]);
        feature_group.addLayer(layerOrder[index]);
    }
    //add comment sign to hide this layer on the map in the initial view.
    feature_group.addLayer(wLiteralLineLayer);
});
//TODO:
$.getJSON(wHydrants, function (wHydrantsArray) {
    var wHydrantsJson = {
        "type": "FeatureCollection",
        "features": wHydrantsArray
    };
    var wHydrantsGeoJson = (wHydrantsJson);

    console.log(wHydrantsGeoJson);

    function pop_wHydrants(feature, layer) {
        var popupContent = '<table><tr><th scope="row">ID: </th><td>' + Autolinker.link(String(feature.properties["id"])) + "</td></tr></table>";
        layer.bindPopup(popupContent);
    }

    wHydrantsLayer = new L.geoJson(wHydrantsGeoJson, {
        onEachFeature: pop_wHydrants,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 6.4,
                fillColor: "#ffffff",
                color: "#000000",
                weight: 1,
                opacity: 1.0,
                fillOpacity: 1.0
            });
        }
    });

    layerOrder[layerOrder.length] = wHydrantsLayer;

    for (var index = 0; index < layerOrder.length; index++) {
        feature_group.removeLayer(layerOrder[index]);
        feature_group.addLayer(layerOrder[index]);
    }
    //add comment sign to hide this layer on the map in the initial view.
    feature_group.addLayer(wHydrantsLayer);
});
//TODO: 
$.getJSON(wServiceConnection, function (wServiceConnectionArray) {
    var wServiceConnectionJson = {
        "type": "FeatureCollection",
        "features": wServiceConnectionArray
    };
    var wServiceConnectionGeoJson = (wServiceConnectionJson);

    console.log(wServiceConnectionGeoJson);
   
    function popWServiceConnections(feature, layer) {
        var popupContent = '<table><tr><th scope="row">Feature: </th><td>' + Autolinker.link(String(feature.properties["feature"])) + '</td></tr><tr><th scope="row">Active Flag: </th><td>' + Autolinker.link(String(feature.properties["activeFlag"])) + '</td></tr><tr><th scope="row">Owned By: </th><td>' + Autolinker.link(String(feature.properties["ownedBy"])) + '</td></tr><tr><th scope="row">Managed By: </th><td>' + Autolinker.link(String(feature.properties["managedBy"])) + '</td></tr><tr><th scope="row">Account Number</th><td>' + Autolinker.link(String(feature.properties["accNumber"])) + '</td></tr><tr><th scope="row">Account Holder</th><td>' + Autolinker.link(String(feature.properties["accHolder"])) + '</td></tr><tr><th scope="row">Service Type</th><td>' + Autolinker.link(String(feature.properties["serviceTyp"])) + '</td></tr><tr><th scope="row">Meter Number</th><td>' + Autolinker.link(String(feature.properties["meterNumb"])) + '</td></tr><tr><th scope="row">Facility ID</th><td>' + Autolinker.link(String(feature.properties["standId"])) + "</td></tr></table>";
        layer.bindPopup(popupContent);
    }

    wServiceConnectionLayer = new L.geoJson(wServiceConnectionGeoJson, {
        onEachFeature: popWServiceConnections,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 6.0,
                fillColor: "#a6cee3",
                color: "#000000",
                weight: 1,
                opacity: 1.0,
                fillOpacity: 1.0
            });
        }
    });

    layerOrder[layerOrder.length] = wServiceConnectionLayer;

    for (var index = 0; index < layerOrder.length; index++) {
        feature_group.removeLayer(layerOrder[index]);
        feature_group.addLayer(layerOrder[index]);
    }
    //add comment sign to hide this layer on the map in the initial view.
    feature_group.addLayer(wServiceConnectionLayer);
});
//TODO: 
$.getJSON(wValves, function (wValvesArray) {
    var wValvesJson = {
        "type": "FeatureCollection",
        "features": wValvesArray
    };
    var wValvesGeoJson = (wValvesJson);

    console.log(wValvesGeoJson);

    function popWValves(feature, layer) {
        var popupContent = '<table><tr><th scope="row">id</th><td>' + Autolinker.link(String(feature.properties["id"])) + '</td></tr><tr><th scope="row">size</th><td>' + Autolinker.link(String(feature.properties["size"])) + '</td></tr><tr><th scope="row">feature</th><td>' + Autolinker.link(String(feature.properties["feature"])) + "</td></tr></table>";
        layer.bindPopup(popupContent);
    }

    wValvesLayer = new L.geoJson(wValvesGeoJson, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 6.4,
                fillColor: "#0678b5",
                color: "#000000",
                weight: 1,
                opacity: 1.0,
                fillOpacity: 1.0
            });
        }
    });

    layerOrder[layerOrder.length] = wValvesLayer;

    for (var index = 0; index < layerOrder.length; index++) {
        feature_group.removeLayer(layerOrder[index]);
        feature_group.addLayer(layerOrder[index]);
    }
    //add comment sign to hide this layer on the map in the initial view.
    feature_group.addLayer(wValvesLayer);
});

feature_group.addTo(map);
//TODO:
var title = new L.Control();
//TODO
title.onAdd = function (map) {
    this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
    this.update();
    return this._div;
};
title.update = function () {
    this._div.innerHTML = "<h2>Water Reticulation System Module</h2></br><h4>Click on the pipe to be mantained for details and state.</h4>";
};
title.addTo(map);
var legend = L.control({
    position: "bottomright"
});
legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend");
    div.innerHTML = "<h3>Legend</h3><table></table>";
    return div;
};
//TODO:
var baseMaps = {
    'OSM Standard': osm,
    'ESRI': esriWorldImagery,
    'Map Quest': mapQuestOpenAerial
};
    L.control.layers(baseMaps, {
        "Main Line": wMainLineLayer,
        "Service Connections": wServiceConnectionLayer,
        "Hydrants": wHydrantsLayer,
        "Valves": wValvesLayer,
        "Literal Line": wLiteralLineLayer,
        "Windsor Park": windsorLayer
    },{collapsed: true}).addTo(map);
L.control.scale({
    options: {
        position: "bottomleft",
        maxWidth: 100,
        metric: true,
        imperial: true,
        updateWhenIdle: true
    }
});