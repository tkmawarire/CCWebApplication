    L.ImageOverlay.include({
        getBounds: function () {
            return this._bounds;
        }
    });
var fmarker = L.Icon.extend({
    options: {
        shadowUrl: "/Content/images/marker-shadow.png",
        iconSize: [24, 32],
        //shadowSize [50, 64],
        iconAnchor: [22, 94],
        //shadowAnchor: [0, 62],
        popupAnchor: [-10, -84]
    }
});
var MapMarker = L.Icon.extend({
    options: {
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
        //popupAnchor: [0, -76]
    }
});
var engineering = new fmarker({
    iconUrl: "/Content/images/engineering.png"
}),
    halloween = new fmarker({
        iconUrl: "/Content/images/halloween.png"
    }),
    exhibitions = new fmarker({
        iconUrl: "/Content/images/exhibitions.png"
    }),
    travel = new fmarker({
        iconUrl: "/Content/images/travel.png"
    }),
    land = new fmarker({
        iconUrl: "/Content/images/vacant-land.png"
    });
var map = L.map("map", {
    zoomControl: false
});
map.setView([-19.45113496179399, 29.798011779785156], 12);
var osmBase = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 28,
    attribution: "Map data &copy; OpenStreetMap contributors"
});
var tileOptions = {
    maxZoom: 28, // max zoom to preserve detail on
    tolerance: 10, // simplification tolerance (higher means simpler)
    extent: 4096, // tile extent (both width and height)
    buffer: 64, // tile buffer on each side
    debug: 0, // logging level (0 to disable, 1 or 2)
    indexMaxZoom: 0, // max zoom in the initial tile index
    indexMaxPoints: 100000 // max number of points per tile in the index
};
function colorizeStandFeatures(stands) {
    var counter = 0;
    for (var i = 0; i < stands.features.length; i++) {
        stands.features[i].properties.color = getStandsColor(stands.features[i].properties.townshipid);
        stands.features[i].properties.label = getStandsColor(stands.features[i].properties.standid);
        counter += stands.features[i].geometry.coordinates[0].length;
    }
    return counter;
}
function getStandsColor(d) {
    var colors = ["AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "Beige", "Bisque", "Black", "BlanchedAlmond", "Blue", "BlueViolet", "Brown", "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk", "Crimson", "Cyan", "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGrey", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "Darkorange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DarkSlateGrey", "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DimGray", "DimGrey", "DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia", "Gainsboro", "GhostWhite", "Gold", "GoldenRod", "Gray", "Grey", "Green", "GreenYellow", "HoneyDew", "HotPink", "IndianRed", "Indigo", "Ivory", "Khaki", "Lavender", "LavenderBlush", "LawnGreen", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan", "LightGoldenRodYellow", "LightGray", "LightGrey", "LightGreen", "LightPink", "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSlateGray", "LightSlateGrey", "LightSteelBlue", "LightYellow", "Lime", "LimeGreen", "Linen", "Magenta", "Maroon", "MediumAquaMarine", "MediumBlue", "MediumOrchid", "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise", "MediumVioletRed", "MidnightBlue", "MintCream", "MistyRose", "Moccasin", "NavajoWhite", "Navy", "OldLace", "Olive", "OliveDrab", "Orange", "OrangeRed", "Orchid", "PaleGoldenRod", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PapayaWhip", "PeachPuff", "Peru", "Pink", "Plum", "PowderBlue", "Purple", "Red", "RosyBrown", "RoyalBlue", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "SeaShell", "Sienna", "Silver", "SkyBlue", "SlateBlue", "SlateGray", "SlateGrey", "Snow", "SpringGreen", "SteelBlue", "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat", "White", "WhiteSmoke", "Yellow", "YellowGreen"];
    return d > 80 ? colors[80] :
        d > 79 ? colors[79] :
        d > 78 ? colors[78] :
        d > 77 ? colors[77] :
        d > 76 ? colors[76] :
        d > 75 ? colors[75] :
        d > 74 ? colors[74] :
        d > 73 ? colors[73] :
        d > 72 ? colors[72] :
        d > 71 ? colors[71] :
        d > 70 ? colors[70] :
        d > 69 ? colors[69] :
        d > 68 ? colors[68] :
        d > 67 ? colors[67] :
        d > 66 ? colors[66] :
        d > 65 ? colors[65] :
        d > 64 ? colors[64] :
        d > 63 ? colors[63] :
        d > 62 ? colors[62] :
        d > 61 ? colors[61] :
        d > 60 ? colors[60] :
        d > 59 ? colors[59] :
        d > 58 ? colors[58] :
        d > 57 ? colors[57] :
        d > 56 ? colors[56] :
        d > 55 ? colors[55] :
        d > 54 ? colors[54] :
        d > 53 ? colors[53] :
        d > 52 ? colors[52] :
        d > 51 ? colors[51] :
        d > 50 ? colors[50] :
        d > 49 ? colors[49] :
        d > 48 ? colors[48] :
        d > 47 ? colors[47] :
        d > 46 ? colors[46] :
        d > 45 ? colors[45] :
        d > 44 ? colors[44] :
        d > 43 ? colors[43] :
        d > 42 ? colors[42] :
        d > 41 ? colors[41] :
        d > 40 ? colors[40] :
        d > 39 ? colors[39] :
        d > 38 ? colors[38] :
        d > 37 ? colors[37] :
        d > 36 ? colors[36] :
        d > 35 ? colors[35] :
        d > 34 ? colors[34] :
        d > 33 ? colors[33] :
        d > 32 ? colors[32] :
        d > 31 ? colors[31] :
        d > 30 ? colors[30] :
        d > 29 ? colors[29] :
        d > 28 ? colors[28] :
        d > 27 ? colors[27] :
        d > 26 ? colors[26] :
        d > 25 ? colors[25] :
        d > 24 ? colors[24] :
        d > 23 ? colors[23] :
        d > 22 ? colors[22] :
        d > 21 ? colors[21] :
        d > 20 ? colors[20] :
        d > 19 ? colors[19] :
        d > 18 ? colors[18] :
        d > 17 ? colors[17] :
        d > 16 ? colors[16] :
        d > 15 ? colors[15] :
        d > 14 ? colors[14] :
        d > 13 ? colors[13] :
        d > 12 ? colors[12] :
        d > 11 ? colors[11] :
        d > 10 ? colors[10] :
        d > 9 ? colors[9] :
        d > 8 ? colors[8] :
        d > 7 ? colors[7] :
        d > 6 ? colors[6] :
        d > 5 ? colors[5] :
        d > 4 ? colors[4] :
        d > 3 ? colors[3] :
        d > 2 ? colors[2] :
        d > 1 ? colors[1] :
        d > 0 ? colors[0] :
        colors[1];
}
var standsTileIndex = geojsonvt(standsJSON, tileOptions);
colorizeStandFeatures(standsJSON);
var standsTileLayer = L.canvasTiles().params({
        debug: false,
        padding: 5
    }).drawing(drawingStandsOnCanvas);
var pad = 0;
standsTileLayer.addTo(map);
function drawingStandsOnCanvas(canvasOverlay, params) {
    var bounds = params.bounds;
    params.tilePoint.z = params.zoom;
    var ctx = params.canvas.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    var tile = standsTileIndex.getTile(params.tilePoint.z, params.tilePoint.x, params.tilePoint.y);
    if (!tile) {
        return;
    }
    ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);
    var features = tile.features;
    ctx.strokeStyle = "grey";
    for (var i = 0; i < features.length; i++) {
        var feature = features[i],
            type = feature.type;

        ctx.fillStyle = feature.tags.color ? feature.tags.color : "rgba(255,0,0,0.05)";
        ctx.beginPath();

        for (var j = 0; j < feature.geometry.length; j++) {
            var geom = feature.geometry[j];

            if (type === 1) {
                ctx.arc(geom[0] * ratio + pad, geom[1] * ratio + pad, 2, 0, 2 * Math.PI, false);
                continue;
            }

            for (var k = 0; k < geom.length; k++) {
                var p = geom[k];
                var extent = 4096;

                var x = p[0] / extent * 256;
                var y = p[1] / extent * 256;
                if (k) ctx.lineTo(x + pad, y + pad);
                else ctx.moveTo(x + pad, y + pad);
            }
        }

        if (type === 3 || type === 1) ctx.fill("evenodd");
        ctx.stroke();
    }
};
var feature_group = new L.featureGroup([]);
var bounds_group = new L.featureGroup([]);
var raster_group = new L.LayerGroup([]);
var geojsonCities = new L.geoJson([]);
var geojsonTwonships = new L.geoJson([]);
var geojsonStands = new L.geoJson([]);
var wMainLineLayer = new L.geoJson([]);
var geojsonProvinces = new L.geoJson([]);
var leakageCluster = new L.MarkerClusterGroup({
    showCoverageOnHover: true
});
var valvesCluster = new L.MarkerClusterGroup({
    showCoverageOnHover: true
});
var bulkmterCluster = new L.MarkerClusterGroup({
    showCoverageOnHover: true
});
var hydrantsCluster = new L.MarkerClusterGroup({
    showCoverageOnHover: true
});
var manholeCluster = new L.MarkerClusterGroup({
    showCoverageOnHover: true
});
var layersControl = new L.control.layers([]);
var basemap = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: " &copy; <a href=\"http://openstreetmap.org\">GCC GIS</a> contributors,<a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>",
    maxZoom: 28
});
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
var esriWorldStreetMap = L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
});
var stamenTonerHybrid = L.tileLayer("http://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}.{ext}", {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: "abcd",
    minZoom: 0,
    maxZoom: 20,
    ext: "png"
}).addTo(map);
var initialOrder = new Array();
var layerOrder = new Array();
function stackLayers() {
    for (var index = 0; index < initialOrder.length; index++) {
        map.removeLayer(initialOrder[index]);
        map.addLayer(initialOrder[index]);
    }
}
function restackLayers() {
    for (var index = 0; index < layerOrder.length; index++) {
        layerOrder[index].bringToFront();
    }
}
var baseLayers = {
    'Stands': standsTileLayer,
    'OSM': basemap,
    'ESRI': esriWorldImagery,
    'Map Quest': mapQuestOpenAerial,
    'ESRI Streat': esriWorldStreetMap
};
var overlays = {
    "Cadastral Layer": standsTileLayer,
    "Water Valves Cluster": valvesCluster,
    "Bulk Meters Cluster": bulkmterCluster,
    "Hydrants Cluster": hydrantsCluster,
    "Manholes Cluster": manholeCluster,
    "Water Leaks Cluster": leakageCluster
};
layersControl = L.control.layers(baseLayers, overlays, {
    collapsed: true,
    autoZIndex: true
});
var sidebar = L.control.sidebar("sidebar").addTo(map);
var zoomBoxControl = L.control.zoomBox({
    modal: true, // If false (default), it deactivates after each use.
    position: "bottomright"
    // className: "customClass"  // Class to use to provide icon instead of Font Awesome
});
map.addControl(zoomBoxControl);
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
var controlBar = L.control.bar("bar", {
    position: "bottom",
    visible: false
});
map.addControl(controlBar);
L.easyButton("fa-area-chart", function (btn) {
    controlBar.toggle();
    map.on("click", function () {
        controlBar.hide();
    });
    //setTimeout(function() { controlBar.hide() }, 10000);
}).addTo(map);
$.getJSON(getProvinces, function (provincesArray) {
    var provinceJSON = {
        "type": "FeatureCollection",
        "features": provincesArray
    };
    var provincesGeoJSON = (provinceJSON);
    function popStands(feature, layer) {
    }
    function doStyleProvinces(feature) {
        return {
            weight: 4.44,
            color: "#ff8040",
            fillColor: "#000000",
            dashArray: "1,5",
            lineCap: "square",
            lineJoin: "bevel",
            opacity: 1.0,
            fillOpacity: 0.0
        };
    }
    geojsonProvinces = L.geoJson(provincesGeoJSON, {
        style: doStyleProvinces,
        onEachFeature: popStands
    });
    layerOrder[layerOrder.length] = geojsonProvinces;
    bounds_group.addLayer(geojsonProvinces);
    initialOrder[initialOrder.length] = geojsonProvinces;
});
$.getJSON(getCities, function(citiesArray) {
    var citiesJSON = {
        "type": "FeatureCollection",
        "features": citiesArray
    };
    var citiesGeoJSON = (citiesJSON);
    function popCities(feature, layer) {
    }
    function doStyleCities(feature) {
        return {
            weight: 3.44,
            color: "#804040",
            fillColor: "#000000",
            dashArray: "1,5",
            lineCap: "square",
            lineJoin: "bevel",
            opacity: 1.0,
            fillOpacity: 0.0
        };
    }
    geojsonCities = L.geoJson(citiesGeoJSON, {
        style: doStyleCities,
        onEachFeature: popCities
    });
    layerOrder[layerOrder.length] = geojsonCities;
    bounds_group.addLayer(geojsonCities);
    initialOrder[initialOrder.length] = geojsonCities;
    //feature_group.addLayer(geojsonCities);
});
$.getJSON(getTownships, function(townshipsArray) {
    var townshipsJSON = {
        "type": "FeatureCollection",
        "features": townshipsArray
    };
    var townshipsGeoJSON = (townshipsJSON);
    function popTownships(feature, layer) {
    }
    function doStyleTownships(feature) {
        return {
            weight: 2.44,
            color: "#400000",
            fillColor: "#000000",
            dashArray: "1,5",
            lineCap: "square",
            lineJoin: "bevel",
            opacity: 1.0,
            fillOpacity: 0.0
        };
    }
    geojsonTwonships = L.geoJson(townshipsGeoJSON, {
        style: doStyleTownships,
        onEachFeature: popTownships
    });
    layerOrder[layerOrder.length] = geojsonTwonships;
    bounds_group.addLayer(geojsonTwonships);
    initialOrder[initialOrder.length] = geojsonTwonships;
});
$.getJSON(getValves, function(valvesArray) {
    var valvesJSON = {
        "type": "FeatureCollection",
        "features": valvesArray
    };
    function doPointToLayerValves(feature, latlng) {
        return L.marker(latlng, {
            icon: halloween
        });
    }

    function onEachFeature(feature, layer) {
        var popupContent = '<div class="container-fluid"><table><tr><th scope="row">Valve ID:</th><td>' + Autolinker.link(String(feature.properties["id"])) + '</td></tr><tr><th scope="row">Valve Size:</th><td>' + Autolinker.link(String(feature.properties["size"])) + "</td></tr></table></div>";
        layer.bindPopup(popupContent);
    }
    var valvesGeoJSON = (valvesJSON);
    var geojsonValves = L.geoJson(valvesGeoJSON, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 8.0,
                fillColor: "#a6cee3",
                color: "#000000",
                weight: 1,
                opacity: 1.0,
                fillOpacity: 1.0
            });
        },
        onEachFeature: onEachFeature
    });
    layerOrder[layerOrder.length] = geojsonValves;
    valvesCluster.addLayer(geojsonValves);
    bounds_group.addLayer(geojsonValves);
    valvesCluster.addTo(map);
});
$.getJSON(getLeakages, function(leakageArray) {
    var leakageJSON = {
        "type": "FeatureCollection",
        "features": leakageArray
    };
    function doPointToLayerLeakage(feature, latlng) {
        return L.marker(latlng, {
            icon: engineering
        });
    }
    function onEachFeature(feature, layer) {
        var popupContent = '<div class="container-fluid"><table><tr><th scope="row">Leakage ID:</th><td>' + Autolinker.link(String(feature.properties["id"])) + '</td></tr><tr><th scope="row">Leakage Source:</th><td>' + Autolinker.link(String(feature.properties["source"])) + "</td></tr></table></div>";
        layer.bindPopup(popupContent);
    }
    var leakageGeoJSON = (leakageJSON);
    var geojsonLeakage = L.geoJson(leakageGeoJSON, {
        pointToLayer: doPointToLayerLeakage,
        onEachFeature: onEachFeature
    });
    layerOrder[layerOrder.length] = geojsonLeakage;
    leakageCluster.addLayer(geojsonLeakage);
    bounds_group.addLayer(geojsonLeakage);
    leakageCluster.addTo(map);
});
$.getJSON(getBulkmeters, function(bulkmetrArray) {
    var bulkmetersJSON = {
        "type": "FeatureCollection",
        "features": bulkmetrArray
    };
    function doPointToLayerBulkmeters(feature, latlng) {
        return L.marker(latlng, {
            icon: exhibitions
        });
    }
    function onEachFeature(feature, layer) {
        var popupContent = '<div class="container-fluid"><table><tr><th scope="row">Bulk Meter ID:</th><td>' + Autolinker.link(String(feature.properties["id"])) + "</td></tr></table></div>";
        layer.bindPopup(popupContent);
    }
    var bulkmetersGeoJSON = (bulkmetersJSON);
    var geojsonBulkmtr = L.geoJson(bulkmetersGeoJSON, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 12.0,
                fillColor: "#2e7198",
                color: "#000000",
                weight: 1,
                opacity: 1.0,
                fillOpacity: 1.0
            });
        },
        onEachFeature: onEachFeature
    });
    layerOrder[layerOrder.length] = geojsonBulkmtr;
    bulkmterCluster.addLayer(geojsonBulkmtr);
    bounds_group.addLayer(geojsonBulkmtr);
    bulkmterCluster.addTo(map);
});
$.getJSON(getHydrants, function(hydrantsArray) {
    var hydrantsJSON = {
        "type": "FeatureCollection",
        "features": hydrantsArray
    };
    function doPointToLayerHydrants(feature, latlng) {
        return L.marker(latlng, {
            icon: travel
        });
    }
    function onEachFeature(feature, layer) {
        var popupContent = '<div class="container-fluid"><table><tr><th scope="row">Hydrant ID:</th><td>' + Autolinker.link(String(feature.properties["id"])) + '</td></tr><tr><th scope="row">Hydrant Height:</th><td>' + Autolinker.link(String(feature.properties["height"])) + "</td></tr></table></div>";
        layer.bindPopup(popupContent);
    }
    var hydrantsGeoJSON = (hydrantsJSON);
    var geojsonHydrants = L.geoJson(hydrantsGeoJSON, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 6.0,
                fillColor: "#1dbcde",
                color: "#000000",
                weight: 1,
                opacity: 1.0,
                fillOpacity: 1.0
            });
        },
        onEachFeature: onEachFeature
    });
    layerOrder[layerOrder.length] = geojsonHydrants;

    hydrantsCluster.addLayer(geojsonHydrants);
    bounds_group.addLayer(geojsonHydrants);
    hydrantsCluster.addTo(map);
});
$.getJSON(getManholes, function (manholeArray) {
    var manholeJSON = {
        "type": "FeatureCollection",
        "features": manholeArray
    };
    function doPointToLayerManhole(feature, latlng) {
        return L.marker(latlng, {
            icon: land
        });
    }
    function onEachFeature(feature, layer) {
        var popupContent = '<div class="container-fluid"><table><tr><th scope="row">Manhole ID:</th><td>' + Autolinker.link(String(feature.properties["id"])) + '</td></tr><tr><th scope="row">Manhole Height:</th><td>' + Autolinker.link(String(feature.properties["height"])) + "</td></tr></table></div>";
        layer.bindPopup(popupContent);
    }
    var manholeGeoJSON = (manholeJSON);
    var geojsonManhole = L.geoJson(manholeGeoJSON, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 10.0,
                fillColor: "#4b858b",
                color: "#000000",
                weight: 1,
                opacity: 1.0,
                fillOpacity: 1.0
            });
        },
        onEachFeature: onEachFeature
    });
    layerOrder[layerOrder.length] = geojsonManhole;
    manholeCluster.addLayer(geojsonManhole);
    bounds_group.addLayer(geojsonManhole);
    manholeCluster.addTo(map);
});
$.getJSON(getwMainLine, function (wMainLineArray) {
    var wMainLineJson = {
        "type": "FeatureCollection",
        "features": wMainLineArray
    };
    var wMainLineGeoJson = (wMainLineJson);

    console.log(wMainLineGeoJson);

    function popWMainLine(feature, layer) {
        var popupContent = '<table><tr><th scope="row">Id:</th><td>' + Autolinker.link(String(feature.properties["id"])) + "</td></tr></table>";
        layer.bindPopup(popupContent);
    }
    function doStylewMainLine(feature) {
        return {
            weight: 5.3,
            color: "#c0dfff",
            dashArray: "",
            opacity: 1.0,
            fillOpacity: 1.0
        };
    }
    wMainLineLayer = L.geoJson(wMainLineGeoJson, {
        onEachFeature: popWMainLine,
        style: doStylewMainLine
    }).addTo(map);
    //layerOrder[layerOrder.length] = wMainLineLayer;
    //feature_group.addLayer(wMainLineLayer);
});
raster_group.addTo(map);
feature_group.addTo(map);
stackLayers();
map.on("overlayadd", restackLayers);
map.addControl(layersControl);
$("#grid").kendoGrid({
    height: 450,
    columns: [
        {
            field: "townshipid",
            width: "250px",
            title: "Town ID",


        },
        {
            field: "Latitude",
            width: "250px",
            title: "Latitude",

        },
        {
            field: "Longitude",
            width: "250px",
            title: "Longitude",
        },
        {
            field: "Source",
            width: "300px",
            title: "Source",
            locked: true,
            values: [
                {
                    text: "Pipe",
                    value: "Pipe"
                },
                {
                    text: "Meter",
                    value: "Meter"
                },
                {
                    text: "Bulk Meter",
                    value: "Bulk Meter"
                },
                {
                    text: "Valve",
                    value: "Valve"
                },
                {
                    text: "Hydrant",
                    value: "Hydrant"
                }
            ]
        },
        {
            field: "Point",
            width: "400px",
            title: "Field Name",
        },
        {
            field: "Name",
            width: "400px",
            title: "Town Name",
            locked: true,
            values: [
                {
                    text: "Mkoba",
                    value: "Mkoba"
                },
                {
                    text: "Ivene",
                    value: "Ivene"
                },
                {
                    text: "Southdowns",
                    value: "Southdowns"
                },
                {
                    text: "CBD",
                    value: "Central Business District"
                },
                {
                    text: "Gweru East",
                    value: "Gweru East"
                },
                {
                    text: "Nashville",
                    value: "Nashville"
                },
                {
                    text: "Gweru East",
                    value: "Gweru East"
                },
                {
                    text: "Clonsilla",
                    value: "Clonsilla"
                },
                {
                    text: "Athlone",
                    value: "Athlone"
                },
                {
                    text: "Winsor",
                    value: "Winsor"
                },
                {
                    text: "Riverside",
                    value: "Riverside"
                },
                {
                    text: "Lundi",
                    value: "Lundi"
                },
                {
                    text: "Kopje",
                    value: "Kopje"
                },
                {
                    text: "Daylseford",
                    value: "Daylseford"
                },
                {
                    text: "Harben Park",
                    value: "Harben Park"
                },
                {
                    text: "Ridgemont Heights",
                    value: "Ridgemont Heights"
                },
                {
                    text: "Mambo",
                    value: "Mambo"
                },
                {
                    text: "Ascot",
                    value: "Ascot"
                },
                {
                    text: "Brakenhurst",
                    value: "Brakenhurst"
                },
                {
                    text: "Light Industrial Area",
                    value: "Light Industrial Area"
                },
                {
                    text: "Heavy Industrial Area",
                    value: "Heavy Industrial Area"
                },
                {
                    text: "Nehosho",
                    value: "Nehosho"
                },
                {
                    text: "Senga",
                    value: "Senga"
                },
                {
                    text: "KPMG Housing",
                    value: "KPMG housing"
                }
            ]
        }
    ],
    toolbar: ["excel", "pdf"],
    dataSource: {
        type: "webapi",
        transport: {
            idField: "id",
            read: {
                url: urlGridApiIndex
            }
        },
        schema: {
            data: "Data",
            total: "Total",
            errors: "Errors",
            model: {
                id: "id",
                fields: {
                    townshipid: { type: "number" },
                    Latitude: { type: "number" },
                    Longitude: { type: "number" },
                    Source: { type: "string" },
                    Point: { type: "string" },
                    Name: { type: "string" },
                    id: { type: "number" }
                }
            }
        },
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
        serverGrouping: true,
        serverAggregates: true,
    },
    columnMenu: true,
    //pageable: true,
    pageable: {
        refresh: true,
        pageSizes: true,
        buttonCount: 30
    },
    resizable: true,
    groupable: true,
    navigatable: true,
    selectable: "single row",
    change: function(e) {
        var selectedRows = this.select();
        var selectedDataItems = [];
        for (var i = 0; i < selectedRows.length; i++) {
            var dataItem = this.dataItem(selectedRows[i]);
            selectedDataItems.push(dataItem);
            var markerlatlng = L.latLng(dataItem.Latitude, dataItem.Longitude);
            map.setView(markerlatlng, 16);
            L.circleMarker(markerlatlng, {
                radius: 0.0,
                fillColor: "",
                color: "#000000",
                weight: 0.1,
                opacity: 0.2,
                fillOpacity: 0
            }).addTo(map)
            .bindPopup('<div class="container-fluid"><table><tr><th scope="row">Leakage ID:</th><td>' + dataItem.id + '</td></tr><tr><th scope="row">Leakage Source:</th><td>' + dataItem.Source + "</td></tr></table></div>")
            .openPopup();
            map.panTo(markerlatlng, {
                aminate: true,
                duration: 1.0,
                easeLinearity: 0.70
            });
        }
    },
    sortable: {
        mode: "multiple"
    },
    filterable: true,
    scrollable: true
});
$.getJSON(window.leakageResult, function (data) {
    var chartData = data;
    var height = 300;
    var width = 300;

    var arcRadius1 = [
        { inner: 0.6, outer: 1 },
        { inner: 0.65, outer: 0.95 },
        { inner: 0.70, outer: 0.90},
        { inner: 0.75, outer: 0.85 },
        { inner: 0.80, outer: 0.80 }
    ];

    nv.addGraph(function () {
        var chart = nv.models.pieChart()
            .x(function (d) { return d.key })
            .y(function (d) { return d.y })
            .width(width)
            .height(height)
            .arcsRadius(arcRadius1)
            .showTooltipPercent(true);

        //make it a half circle
        chart.pie
            .startAngle(function (d) { return d.startAngle / 2 - Math.PI / 2 })
            .endAngle(function (d) { return d.endAngle / 2 - Math.PI / 2 });

        d3.select("#pieChart")
            .datum(chartData)
            .transition().duration(1200)
            .attr("width", width)
            .attr("height", height)
            .call(chart);

        // update chart data values randomly
        setInterval(function () {
            chartData[0].y = Math.floor(Math.random() * 10);
            chartData[1].y = Math.floor(Math.random() * 10);
            chart.update();
        }, 4000);

        return chart;
    });

    nv.addGraph(function () {
        var chart = nv.models.pieChart()
            .x(function (d) { return d.key })
            .y(function (d) { return d.y })
            //.labelThreshold(.08)
            //.showLabels(false)
            .color(d3.scale.category20().range().slice(8))
            .growOnHover(true)
            .arcsRadius(arcRadius1)
            .labelType("value")
            .width(width)
            .donut(true)
            .height(height);

        d3.select("#donutChart")
            .datum(chartData)
            .transition().duration(1200)
            .attr("width", width)
            .attr("height", height)
            .call(chart);

        // disable and enable some of the sections
        var is_disabled = false;
        setInterval(function () {
            chart.dispatch.changeState({ disabled: { 2: !is_disabled, 4: !is_disabled } });
            is_disabled = !is_disabled;
        }, 3000);

        return chart;
    });
});
$.getJSON(window.leakageHistogram, function (data) {
    var historicalBarChart = [
        {
            key: "Cumulative Return",
            values: data
        }
    ];
    nv.addGraph(function () {
        var chart = nv.models.discreteBarChart()
                .x(function (d) { return d.label })
                .y(function (d) { return d.value })
                .staggerLabels(true)
                //.staggerLabels(historicalBarChart[0].values.length > 8)
                .showValues(true)
                .duration(250)
        ;

        d3.select("#histogramChart svg")
            .datum(historicalBarChart)
            .call(chart);

        nv.utils.windowResize(chart.update);
        return chart;
    });
});
$.getJSON(window.leakageAreaHistogram, function (data) {
    var historicalBarChart = [
        {
            key: "Cumulative Return",
            values: data
        }
    ];
    nv.addGraph(function () {
        var chart = nv.models.discreteBarChart()
                .x(function (d) { return d.label })
                .y(function (d) { return d.value })
                //.staggerLabels(true)
                .staggerLabels(historicalBarChart[0].values.length > 8)
                .showValues(true)
                .duration(250)
        ;

        d3.select("#areaHistogramChart svg")
            .datum(historicalBarChart)
            .call(chart);

        nv.utils.windowResize(chart.update);
        return chart;
    });
});
$.getJSON(window.leakageResult, function (data) {
    var arcRadius2 = [
        { inner: 0.9, outer: 1 },
        { inner: 0.5, outer: 1 },
        { inner: 0.3, outer: 1 },
        { inner: 0.6, outer: 1 },
        { inner: 0.2, outer: 1 }
    ];

    var height = 300;
    var width = 300;

    nv.addGraph(function () {
        var chart = nv.models.pieChart()
            .x(function (d) { return d.key })
            .y(function (d) { return d.y })
            .donut(true)
            .width(width)
            .height(height)
            .arcsRadius(arcRadius2)
            .donutLabelsOutside(true)
            .labelSunbeamLayout(true)
            .id("donut2"); // allow custom CSS for this one svg

        d3.select("#teamProgress")
            .datum(data)
            .transition().duration(1200)
            .attr("width", width)
            .attr("height", height)
            .call(chart);

        return chart;

    });
});
$.getJSON(window.leakageResult, function (data) {
    var arcRadius3 = [
        { inner: 0, outer: 1 },
        { inner: 0, outer: 0.8 },
        { inner: 0, outer: 0.7 },
        { inner: 0, outer: 0.6 },           
        { inner: 0, outer: 0.5 }
    ];

    var height = 300;
    var width = 300;


    nv.addGraph(function () {
        var chart = nv.models.pieChart()
            .x(function (d) { return d.key })
            .y(function (d) { return d.y })
            .donut(true)
            .showLabels(true)
            .width(width)
            .height(height)
            .arcsRadius(arcRadius3)
            .donutLabelsOutside(true)
            .id("donut3"); // allow custom CSS for this one svg

        d3.select("#teama")
            .datum(data)
            .transition().duration(1200)
            .attr("width", width)
            .attr("height", height)
            .call(chart);

        return chart;

    });
});
