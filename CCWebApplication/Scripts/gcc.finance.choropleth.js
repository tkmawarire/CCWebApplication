
    //var geojsonCadaster = new L.geoJson([]);
    //var map = L.map("mapfinance").setView([-19.447986, 29.749708], 16);
    var map = L.map("map", {
        zoomControl: false,
        contextmenu: true,
        contextmenuWidth: 140,
        contextmenuItems: [{
            text: "Get Zoom Level",
            callback: getZoomLevel
        }, {
            text: "Show coordinates",
            callback: showCoordinates
        }, {
            text: "Center map here",
            callback: centerMap
        }, "-", {
            text: "Zoom in",
            icon: "/Content/images/zoom-in.png",
            callback: zoomIn
        }, {
            text: "Zoom out",
            icon: "/Content/images/zoom-out.png",
            callback: zoomOut
        }]
    }).setView([-19.447986, 29.749708], 16);

    var geojson;
    function showCoordinates(e) {
        alert(e.latlng);
    }

    function centerMap(e) {
        map.panTo(e.latlng);
    }

    function zoomIn(e) {
        map.zoomIn();
    }

    function zoomOut(e) {
        map.zoomOut();
    }
    function getZoomLevel(e) {
        alert(map.getZoom());
    }
    L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw", {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: "mapbox.light"
    }).addTo(map);
    function clearCadastreLayer() {
        map.removeLayer(geojson);
        geojson.clearLayers();
    }
    // control that shows state info on hover
    var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create("div", "info");
        this.update();
        return this._div;
    };

    info.update = function (props) {
        this._div.innerHTML = "<h4>Ammount Owing</h4>" + (props ?
            "<b>" + props.name + "</b><br />" + props.totalamntdue + " USD"
            : "Hover over any property");
    };

    info.addTo(map);

    function getColor(d) {
        return d > 1000 ? "#800026" :
            d > 500 ? "#BD0026" :
            d > 200 ? "#E31A1C" :
            d > 100 ? "#FC4E2A" :
            d > 50 ? "#FD8D3C" :
            d > 20 ? "#FEB24C" :
            d > 10 ? "#FED976" :
            d > 0 ? "#FED976" :
            "#577b04";
    }

    function style(feature) {
        return {
            weight: 2,
            opacity: 1,
            color: "white",
            dashArray: "3",
            fillOpacity: 0.7,
            fillColor: getColor(feature.properties.totalamntdue)
        };
    }

    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: "#666",
            dashArray: "",
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }

        info.update(layer.feature.properties);
    }

  

    function getFinanceData() {

        var bounds = "POLYGON((" + (map.getBounds().getEast() + " " + map.getBounds().getNorth() + "," + map.getBounds().getWest() + " " + map.getBounds().getNorth() + "," + map.getBounds().getWest() + " " + map.getBounds().getSouth() + "," + map.getBounds().getEast() + " " + map.getBounds().getSouth() + "," + map.getBounds().getEast() + " " + map.getBounds().getNorth()) + "))";
        $.getJSON(window.getBoundsFinance + "?bbox=" + bounds, function (propertiesArray) {
            var boundedprop = {
                "type": "FeatureCollection",
                "features": propertiesArray
            };
            var boundedGeoJson = (boundedprop);
            console.log(boundedGeoJson);
            function resetHighlight(e) {
                geojson.resetStyle(e.target);
                info.update();
            }

            function zoomToFeature(e) {
                map.fitBounds(e.target.getBounds());
            }

            function onEachFeature(feature, layer) {
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                    click: zoomToFeature
                });
            }

            geojson = L.geoJson(boundedGeoJson, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);
        });
    }
    map.on("moveend", function () {
        if (map.hasLayer(geojson) === true) {
            clearCadastreLayer();
        }
        getFinanceData();
    });


    map.attributionControl.addAttribution('GCC Finance &copy; <a href="http://giskonsult.com/">GCC Water Audit</a>');


    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function(map) {

        var div = L.DomUtil.create("div", "info legend"),
            grades = [-10, 0, 100, 200, 500],
            labels = [],
            from,
            to;

        for (var i = 0; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];

            labels.push(
                '<i style="background:' + getColor(from + 1) + '"></i> ' +
                from + (to ? "&ndash;" + to : "+"));
        }

        div.innerHTML = labels.join("<br>");
        return div;
    };

    legend.addTo(map);