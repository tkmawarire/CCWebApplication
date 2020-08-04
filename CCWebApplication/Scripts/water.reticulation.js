
var mapboxBase = "https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.jpg90?access_token=pk.eyJ1IjoidGFzaGFhNzgiLCJhIjoiY2lpYWEyNGthMDAxbXVsbHp0cG13ZGJmcSJ9.elYnA87kBzApKdekiM60Yw";
//L.mapbox.accessToken = "pk.eyJ1IjoidGFzaGFhNzgiLCJhIjoiY2lpYWEyNGthMDAxbXVsbHp0cG13ZGJmcSJ9.elYnA87kBzApKdekiM60Yw";

// https: also suppported.
var esriWorldImagery = L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxZoom: 28
});

var MapQuestOpen_Aerial = L.tileLayer("http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}", {
    type: "sat",
    ext: "jpg",
    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency',
    subdomains: "1234"
});
// https: also suppported.
var stamenTonerHybrid = L.tileLayer("http://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}.{ext}", {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: "abcd",
    minZoom: 0,
    maxZoom: 20,
    ext: "png"
});
// https: also suppported.
var esriWorldStreetMap = L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
});

// https: also suppported.
var HERE_hybridDay = L.tileLayer("http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/{type}/{mapID}/hybrid.day/{z}/{x}/{y}/{size}/{format}?app_id={app_id}&app_code={app_code}&lg={language}", {
    attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
    subdomains: "1234",
    mapID: "newest",
    app_id: "<your app_id>",
    app_code: "<your app_code>",
    base: "aerial",
    maxZoom: 20,
    type: "maptile",
    language: "eng",
    format: "png8",
    size: "256"
});

var map = L.map("map", {
    zoomControl: true,
    maxZoom: 24
}).fitBounds([[-19.4627479975, 29.8348333722], [-19.458693015, 29.843062182]]);

var hash = new L.Hash(map);
var additional_attrib = 'created f. <a href="http://localhost:49408/Home/Index" target ="_blank">GCC</a> by <a href="https://gisconsult/" target ="_blank">GISKonsult</a> & <a href="https://github.com/Tashaa78" target ="_blank">Contributors</a><br>';
var feature_group = new L.featureGroup([]);
var raster_group = new L.LayerGroup([]);
var windsorLayer = new L.geoJson([]);
var osm = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: additional_attrib + '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
});
//osm.addTo(map);
var mapBoxTile = L.tileLayer(mapboxBase, {
    attribution: additional_attrib + " &copy; <a href=\"http://mapbox.com\">MapBox</a>",
    maxZoom: 28
});
mapBoxTile.addTo(map);
var layerOrder = new Array();

//function pop_wWindsorPark(feature, layer) {
//    var popupContent = '<table><tr><th scope="row">OBJECTID</th><td>' + Autolinker.link(String(feature.properties["OBJECTID"])) + '</td></tr><tr><th scope="row">Shape_Leng</th><td>' + Autolinker.link(String(feature.properties["Shape_Leng"])) + '</td></tr><tr><th scope="row">Shape_Area</th><td>' + Autolinker.link(String(feature.properties["Shape_Area"])) + '</td></tr><tr><th scope="row">standid</th><td>' + Autolinker.link(String(feature.properties["standid"])) + '</td></tr><tr><th scope="row">standnum</th><td>' + Autolinker.link(String(feature.properties["standnum"])) + "</td></tr></table>";
//    layer.bindPopup(popupContent);
//}

//function doStylewWindsorPark(feature) {
//    return {
//        color: "#000000",
//        fillColor: "#babfc9",
//        weight: 0.2,
//        dashArray: "",
//        opacity: 1.0,
//        fillOpacity: 1.0
//    };

//}
//var exp_wWindsorParkJSON = new L.geoJson(exp_wWindsorPark, {
//    onEachFeature: pop_wWindsorPark,
//    style: doStylewWindsorPark
//});
//layerOrder[layerOrder.length] = exp_wWindsorParkJSON;

//for (index = 0; index < layerOrder.length; index++) {
//    feature_group.removeLayer(layerOrder[index]);
//    feature_group.addLayer(layerOrder[index]);
//}
////add comment sign to hide this layer on the map in the initial view.
//feature_group.addLayer(exp_wWindsorParkJSON);


//TODO: Get data via Ajax
$.getJSON(wWindsorPark, function (windsorArray) {
    var windsorJson = {
        "type": "FeatureCollection",
        "features": windsorArray
    };
    var windsorGeoJson = (windsorJson);

    console.log(windsorGeoJson);

        function pop_wWindsorPark(feature, layer) {
            var popupContent = '<table><tr><th scope="row">OBJECTID</th><td>' + Autolinker.link(String(feature.properties["OBJECTID"])) + '</td></tr><tr><th scope="row">Shape_Leng</th><td>' + Autolinker.link(String(feature.properties["Shape_Leng"])) + '</td></tr><tr><th scope="row">Shape_Area</th><td>' + Autolinker.link(String(feature.properties["Shape_Area"])) + '</td></tr><tr><th scope="row">standid</th><td>' + Autolinker.link(String(feature.properties["standid"])) + '</td></tr><tr><th scope="row">standnum</th><td>' + Autolinker.link(String(feature.properties["standnum"])) + "</td></tr></table>";
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
        onEachFeature: pop_wWindsorPark,
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

function pop_wLiteralLine(feature, layer) {
    var popupContent = '<table><tr><th scope="row">id</th><td>' + Autolinker.link(String(feature.properties["id"])) + '</td></tr><tr><th scope="row">Enabled</th><td>' + Autolinker.link(String(feature.properties["Enabled"])) + '</td></tr><tr><th scope="row">ActiveFlag</th><td>' + Autolinker.link(String(feature.properties["ActiveFlag"])) + '</td></tr><tr><th scope="row">ManagedBy</th><td>' + Autolinker.link(String(feature.properties["ManagedBy"])) + '</td></tr><tr><th scope="row">OwnedBy</th><td>' + Autolinker.link(String(feature.properties["OwnedBy"])) + '</td></tr><tr><th scope="row">LineType</th><td>' + Autolinker.link(String(feature.properties["LineType"])) + '</td></tr><tr><th scope="row">Material</th><td>' + Autolinker.link(String(feature.properties["Material"])) + '</td></tr><tr><th scope="row">FacilityId</th><td>' + Autolinker.link(String(feature.properties["FacilityId"])) + '</td></tr><tr><th scope="row">InstalDate</th><td>' + Autolinker.link(String(feature.properties["InstalDate"])) + '</td></tr><tr><th scope="row">Diameter</th><td>' + Autolinker.link(String(feature.properties["Diameter"])) + '</td></tr><tr><th scope="row">LastUpdate</th><td>' + Autolinker.link(String(feature.properties["LastUpdate"])) + "</td></tr></table>";
    layer.bindPopup(popupContent);
}

function doStylewLiteralLine(feature) {
    return {
        weight: 2.3,
        color: "#1f78b4",
        dashArray: "",
        opacity: 1.0,
        fillOpacity: 1.0
    };
}
var exp_wLiteralLineJSON = new L.geoJson(exp_wLiteralLine, {
    onEachFeature: pop_wLiteralLine,
    style: doStylewLiteralLine
});

layerOrder[layerOrder.length] = exp_wLiteralLineJSON;

for (index = 0; index < layerOrder.length; index++) {
    feature_group.removeLayer(layerOrder[index]);
    feature_group.addLayer(layerOrder[index]);
}
//add comment sign to hide this layer on the map in the initial view.
feature_group.addLayer(exp_wLiteralLineJSON);

function pop_wHydrants(feature, layer) {
    var popupContent = '<table><tr><th scope="row">id</th><td>' + Autolinker.link(String(feature.properties["id"])) + '</td></tr><tr><th scope="row">hydrant</th><td>' + Autolinker.link(String(feature.properties["hydrant"])) + '</td></tr><tr><th scope="row">lat</th><td>' + Autolinker.link(String(feature.properties["lat"])) + '</td></tr><tr><th scope="row">long</th><td>' + Autolinker.link(String(feature.properties["long"])) + "</td></tr></table>";
    layer.bindPopup(popupContent);
}

var exp_wHydrantsJSON = new L.geoJson(exp_wHydrants, {
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
//add comment sign to hide this layer on the map in the initial view.
feature_group.addLayer(exp_wHydrantsJSON);

function pop_wServiceConnections(feature, layer) {
    var popupContent = '<table><tr><th scope="row">Enabled</th><td>' + Autolinker.link(String(feature.properties["Enabled"])) + '</td></tr><tr><th scope="row">ActiveFlag</th><td>' + Autolinker.link(String(feature.properties["ActiveFlag"])) + '</td></tr><tr><th scope="row">OwnedBy</th><td>' + Autolinker.link(String(feature.properties["OwnedBy"])) + '</td></tr><tr><th scope="row">ManagedBy</th><td>' + Autolinker.link(String(feature.properties["ManagedBy"])) + '</td></tr><tr><th scope="row">AccNumber</th><td>' + Autolinker.link(String(feature.properties["AccNumber"])) + '</td></tr><tr><th scope="row">AccHolder</th><td>' + Autolinker.link(String(feature.properties["AccHolder"])) + '</td></tr><tr><th scope="row">ServiceTyp</th><td>' + Autolinker.link(String(feature.properties["ServiceTyp"])) + '</td></tr><tr><th scope="row">MeterNumb</th><td>' + Autolinker.link(String(feature.properties["MeterNumb"])) + '</td></tr><tr><th scope="row">FacilityId</th><td>' + Autolinker.link(String(feature.properties["FacilityId"])) + "</td></tr></table>";
    layer.bindPopup(popupContent);
}

var exp_wServiceConnectionsJSON = new L.geoJson(exp_wServiceConnections, {
    onEachFeature: pop_wServiceConnections,
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
//add comment sign to hide this layer on the map in the initial view.
feature_group.addLayer(exp_wServiceConnectionsJSON);

function pop_wMainLine(feature, layer) {
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
var exp_wMainLineJSON = new L.geoJson(exp_wMainLine, {
    onEachFeature: pop_wMainLine,
    style: doStylewMainLine
});
layerOrder[layerOrder.length] = exp_wMainLineJSON;

for (index = 0; index < layerOrder.length; index++) {
    feature_group.removeLayer(layerOrder[index]);
    feature_group.addLayer(layerOrder[index]);
}
//add comment sign to hide this layer on the map in the initial view.
feature_group.addLayer(exp_wMainLineJSON);

feature_group.addTo(map);

var title = new L.Control();

title.onAdd = function (map) {
    this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
    this.update();
    return this._div;
};
title.update = function () {
    this._div.innerHTML = "<h2>Water Reticulation System Module</h2>EdgeTechnologies";
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
legend.addTo(map);
var baseMaps = {
    'OSM Standard': osm,
    'ESRI': esriWorldImagery,
    'Map Quest': MapQuestOpen_Aerial
};
L.control.layers(baseMaps, {
    "wMainLine": exp_wMainLineJSON,
    "wServiceConnections": exp_wServiceConnectionsJSON,
    "wHydrants": exp_wHydrantsJSON,
    "wLiteralLine": exp_wLiteralLineJSON,
    //"wWindsorPark": exp_wWindsorParkJSON //
    "wWindsorPark": windsorLayer
}, {
    collapsed: true
}).addTo(map);

L.control.scale({
    options: {
        position: "bottomleft",
        maxWidth: 100,
        metric: true,
        imperial: false,
        updateWhenIdle: false
    }
}).addTo(map);