        L.ImageOverlay.include( {
            getBounds: function ()
            {
                return this._bounds;
            }
        } );
    var fmarker = L.Icon.extend( {
        options: {
            shadowUrl: "/Content/images/marker-shadow.png",
            iconSize: [24, 32],
            //shadowSize [50, 64],
            iconAnchor: [22, 94],
            //shadowAnchor: [0, 62],
            popupAnchor: [-10, -84]
        }
    } );
    var MapMarker = L.Icon.extend( {
        options: {
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
            //popupAnchor: [0, -76]
        }
    } );
    var engineering = new fmarker( {
        iconUrl: "/Content/images/engineering.png"
    } ),
        halloween = new fmarker( {
            iconUrl: "/Content/images/halloween.png"
        } ),
        exhibitions = new fmarker( {
            iconUrl: "/Content/images/exhibitions.png"
        } ),
        travel = new fmarker( {
            iconUrl: "/Content/images/travel.png"
        } ),
        land = new fmarker( {
            iconUrl: "/Content/images/vacant-land.png"
        } );
    var map = L.map( "map", {
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
    } ).setView( [-19.447986, 29.749708], 16 );


    function showCoordinates( e )
    {
        alert( e.latlng );
    }

    function centerMap( e )
    {
        map.panTo( e.latlng );
    }

    function zoomIn( e )
    {
        map.zoomIn();
    }

    function zoomOut( e )
    {
        map.zoomOut();
    }
    function getZoomLevel( e )
    {
        alert( map.getZoom() );
    }

    var osmBase = L.tileLayer( "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 28,
        attribution: "Map data &copy; OpenStreetMap contributors"
    } );
    var feature_group = new L.featureGroup( [] );
    var bounds_group = new L.featureGroup( [] );
    var raster_group = new L.LayerGroup( [] );
    var geojsonCadaster = new L.geoJson( [] );
    var basemap = L.tileLayer( "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: " &copy; <a href=\"http://openstreetmap.org\">GCC Fault Reporting</a> contributors,<a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>",
        maxZoom: 28
    } );
    var esriWorldImagery = L.tileLayer( "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        maxZoom: 28
    } ).addTo( map );
    var mapQuestOpenAerial = L.tileLayer( "http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}", {
        type: "sat",
        ext: "jpg",
        attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency',
        subdomains: "1234"
    } );
    var esriWorldStreetMap = L.tileLayer( "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
    } );
    var layerOrder = new Array();
    function stackLayers()
    {
        for ( var index = 0; index < layerOrder.length; index++ )
        {
            map.removeLayer( layerOrder[index] );
            map.addLayer( layerOrder[index] );
        }
    }
    function restackLayers()
    {
        for ( var index = 0; index < layerOrder.length; index++ )
        {
            layerOrder[index].bringToFront();
        }
    }
    layerControl = L.control.layers( {}, {}, { collapsed: false } );
    function clearCadastreLayer()
    {
        map.removeLayer( geojsonCadaster );
        geojsonCadaster.clearLayers();
    }
    var sidebar = L.control.sidebar( "sidebar" ).addTo( map );
    var zoomBoxControl = L.control.zoomBox( {
        modal: true, // If false (default), it deactivates after each use.
        position: "bottomright"
        // className: "customClass"  // Class to use to provide icon instead of Font Awesome
    } );
    map.addControl( zoomBoxControl );
    L.control.locate( {
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
        onLocationError: function ( err )
        {
            alert( err.message )
        }, // define an error callback function
        onLocationOutsideMapBounds: function ( context )
        { // called when outside map boundaries
            alert( context.options.strings.outsideMapBoundsMsg );
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
    } ).addTo( map );
    var navbar = new L.control.Navbar( {
        position: "bottomright",
        center: [-19.4584, 29.8120],
        zoom: 16
    } ).addTo( map );
    L.easyPrint( {
        title: "My awesome print button",
        //elementsToHide: 'p, h2, .gitButton',
        position: "bottomright"
    } ).addTo( map );
    var controlBar = L.control.bar( "bar", {
        position: "bottom",
        visible: false
    } );
    map.addControl( controlBar );
    L.easyButton( "fa-area-chart", function ( btn )
    {
        controlBar.toggle();
        map.on( "click", function ()
        {
            controlBar.hide();
        } );
        //setTimeout(function() { controlBar.hide() }, 10000);
    } ).addTo( map );

    var tileOptions = {
        maxZoom: 28, // max zoom to preserve detail on
        tolerance: 10, // simplification tolerance (higher means simpler)
        extent: 4096, // tile extent (both width and height)
        buffer: 64, // tile buffer on each side
        debug: 0, // logging level (0 to disable, 1 or 2)
        indexMaxZoom: 0, // max zoom in the initial tile index
        indexMaxPoints: 100000 // max number of points per tile in the index
    };
    function colorizeStandFeatures( stands )
    {
        var counter = 0;
        for ( var i = 0; i < stands.features.length; i++ )
        {
            stands.features[i].properties.color = getStandsColor( stands.features[i].properties.townshipid );
            stands.features[i].properties.label = getStandsColor( stands.features[i].properties.standid );
            counter += stands.features[i].geometry.coordinates[0].length;
        }
        return counter;
    }
    function getStandsColor( d )
    {
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
    var standsTileIndex = geojsonvt( standsJSON, tileOptions );
    colorizeStandFeatures( standsJSON );
    var standsTileLayer = L.canvasTiles().params( {
        debug: false,
        padding: 5
    } ).drawing( drawingStandsOnCanvas );
    var pad = 0;
    //standsTileLayer.addTo(map);
    function drawingStandsOnCanvas( canvasOverlay, params )
    {
        var bounds = params.bounds;
        params.tilePoint.z = params.zoom;
        var ctx = params.canvas.getContext( "2d" );
        ctx.globalCompositeOperation = "source-over";
        var tile = standsTileIndex.getTile( params.tilePoint.z, params.tilePoint.x, params.tilePoint.y );
        if ( !tile )
        {
            return;
        }
        ctx.clearRect( 0, 0, params.canvas.width, params.canvas.height );
        var features = tile.features;
        ctx.strokeStyle = "grey";
        for ( var i = 0; i < features.length; i++ )
        {
            var feature = features[i],
                type = feature.type;

            ctx.fillStyle = feature.tags.color ? feature.tags.color : "rgba(255,0,0,0.05)";
            ctx.beginPath();

            for ( var j = 0; j < feature.geometry.length; j++ )
            {
                var geom = feature.geometry[j];

                if ( type === 1 )
                {
                    ctx.arc( geom[0] * ratio + pad, geom[1] * ratio + pad, 2, 0, 2 * Math.PI, false );
                    continue;
                }

                for ( var k = 0; k < geom.length; k++ )
                {
                    var p = geom[k];
                    var extent = 4096;

                    var x = p[0] / extent * 256;
                    var y = p[1] / extent * 256;
                    if ( k ) ctx.lineTo( x + pad, y + pad );
                    else ctx.moveTo( x + pad, y + pad );
                }
            }

            if ( type === 3 || type === 1 ) ctx.fill( "evenodd" );
            ctx.stroke();
        }
    };
    //map.on("moveend", function () {
    //if (map.hasLayer(geojsonCadaster) === true) {
    //clearCadastreLayer();
    //}
    //var bounds = "POLYGON(("+(map.getBounds().getEast() + " " + map.getBounds().getNorth() + "," + map.getBounds().getWest() + " " + map.getBounds().getNorth() + "," + map.getBounds().getWest() + " " + map.getBounds().getSouth() + "," + map.getBounds().getEast() + " " + map.getBounds().getSouth() + "," + map.getBounds().getEast() + " " + map.getBounds().getNorth())+"))";
    //$.getJSON(window.getBoundsFinance+"?bbox=" + bounds, function (propertiesArray) {
    //var boundedprop = {
    //"type": "FeatureCollection",
    //"features": propertiesArray
    //};
    //var boundedGeoJson = (boundedprop);
    //console.log(boundedGeoJson);
    //function popHouses(feature, layer) {
    //    var popupContent = '<table><tr><th scope="row">Account Number</th><td>' + feature.properties.account + '</td></tr><tr><th scope="row">Current Payment:</th><td> $' + feature.properties.currentpayment + '</td></tr><tr><th scope="row">Total Amnt Due:</th><td> $' + feature.properties.totalamntdue + '</td></tr><tr><th scope="row">Dept:</th><td>' + feature.properties.dept + '</td></tr><tr><th scope="row">Cons Code:</th><td>' + feature.properties.conscode + '</td></tr><tr><th scope="row">Account Active:</th><td>' + feature.properties.active + '</td></tr><tr><th scope="row">Account Holder:</th><td>' + feature.properties.name + '</td></tr><tr><th scope="row">Township:</th><td> Mkoba' + " " + feature.properties.township + '</td></tr><tr><th scope="row">GP Stand ID:</th><td>' + feature.properties.standid + '</td></tr><tr><th scope="row">Meter Number:</th><td>' + feature.properties.meternumber + '</td></tr><tr><th scope="row">Current Reading:</th><td>' + feature.properties.reading + '</td></tr><tr><th scope="row">Meter Condition:</th><td>' + feature.properties.condition + '</td></tr><tr><th scope="row">Number of Residents:</th><td>' + feature.properties.residents + '</td></tr><tr><th scope="row">Water Source:</th><td>' + feature.properties.watersource + '</td></tr><tr><th scope="row">Illegal Connection?:</th><td>' + feature.properties.illegalconnection + '</td></tr><tr><th scope="row">Burst Pipes?:</th><td>' + feature.properties.burstpipe + '</td></tr><tr><th scope="row">Number of Toilet Seats:</th><td>' + feature.properties.toiletseats + "</td></tr></table>";
    //layer.bindPopup(popupContent);
    //}
    //function doStyleHouses(feature) {
    //var fillColor;
    //switch (feature.properties.condition) {
    //case "NOT WORKING":
    //fillColor = "Darkorange";
    //break;
    //    case "WORKING":
    //fillColor = "Green";
    //break;
    //case "NULL":
    //fillColor = "DarkRed";
    //break;
    //case "LEAKING":
    //fillColor = "DarkSalmon";
    //break;
    //case "":
    //    fillColor = "DarkRed";
    //break;
    //default:
    //    fillColor = "Darkorange";
    //break;
    //}
    //return {
    //weight: 0.26,
    //color: "#000000",
    //fillColor: fillColor,
    //dashArray: "",
    //lineCap: "square",
    //lineJoin: "bevel",
    //opacity: 0.62,
    //fillOpacity: 1
    //};
    //}

    //geojsonCadaster = L.geoJson(boundedGeoJson, {
    //style: doStyleHouses,
    //onEachFeature: popHouses
    //});
    ////geojsonCadaster.addTo(map);
    //layerOrder[layerOrder.length] = geojsonCadaster;
    //});
    //});
    $( "#grid" ).kendoGrid( {
        height: 450,
        columns: [
            {
                field: "Account",
                width: "150px",
                title: "Account Number",
                lockable: true
            },
            {
                field: "CurrentPayment",
                width: "150px",
                title: "Current Payment(USD)",
                lockable: true
            },
            {
                field: "TOTAL",
                width: "150px",
                title: "Amount Due(USD)",
                lockable: true
            },
            { field: "Dept" },
            { field: "Cons_Code" },
            {
                field: "Active",
                width: "200px",
                title: "Account Active",
                locked: false
            },
            {
                field: "Name",
                width: "300px",
                title: "Account Holder",
                locked: false
            },
            {
                field: "TOWNSHIPID",
                width: "100px",
                title: "Township",
                locked: false

            },
            {
                field: "STANDID",
                width: "100px",
                title: "Stand Number",
                locked: false
            },
            {
                field: "METER_NUMBER",
                width: "200px",
                title: "Meter Number",
                lockable: true
            },
            {
                field: "READING",
                width: "100px",
                title: "Reading",
                locked: false
            },
            {
                field: "CONDITION",
                width: "200px",
                title: "Meter Condition",
                locked: false,
                values: [
                    {
                        text: "NOT WORKING",
                        value: "NOT WORKING"
                    },
                    {
                        text: "NULL",
                        value: "NULL"
                    },
                    {
                        text: "NO INFO",
                        value: ""
                    },
                    {
                        text: "N/A",
                        value: "N/A"
                    },
                    {
                        text: "WORKING",
                        value: "WORKING"
                    }
                ]

            },
            {
                field: "RESIDENTS",
                width: "100px",
                title: "Residents",
                locked: false

            },
            {
                field: "WATER_SOURCE",
                width: "200px",
                title: "Water Source",
                locked: false,
                values: [
                    {
                        text: "MUNICIPAL",
                        value: "MUNICIPAL"
                    },
                    {
                        text: "NO INFO",
                        value: ""
                    }
                ]
            },
            {
                field: "ILLEGAL_CONNECTION_",
                width: "100px",
                title: "Illegal Connection",
                locked: false,
                values: [
                    {
                        text: "YES",
                        value: "YES"
                    },
                    {
                        text: "NO",
                        value: "NO"
                    },
                    {
                        text: "NO INFO",
                        value: ""
                    },
                    {
                        text: "NULL",
                        value: "NULL"
                    }
                ]
            },
            {
                field: "BURST_PIPES__",
                width: "100px",
                title: "Burst Pipes",
                locked: false,
                values: [
                    {
                        text: "YES",
                        value: "YES"
                    },
                    {
                        text: "NO",
                        value: "NO"
                    },
                    {
                        text: "NO INFO",
                        value: ""
                    },
                    {
                        text: "N/A",
                        value: "N/A"
                    }
                ]
            },
            {
                field: "TOILET_SEATS_",
                width: "100px",
                title: "Toilet Seats",
                locked: false
            },
            {
                field: "xCoordinate",
                title: "Longitude",
                visible: false
            },
            {
                field: "yCoordinate",
                title: "Latitude",
                visible: false
            },
            //{
            //    field: "wkt",
            //    title: "Well Known Text",
            //    width: "500px",
            //    visible: false
            //}
        ],
        toolbar: ["excel", "pdf"],
        dataSource: {
            type: "webapi",
            transport: {
                idField: "id",
                read: {
                    //url: "/api/vwMkobaMatchingGrids"
                    //url: "/api/vwFinanceGridCoordinates"
                    url: urlGridApi
                }
            },
            schema: {
                data: "Data",
                total: "Total",
                errors: "Errors",
                model: {
                    id: "id",
                    fields: {
                        id: { type: "number" },
                        Account: { type: "string" },
                        CurrentPayment: { type: "number" },
                        TOTAL: { type: "number" },
                        Dept: { type: "string" },
                        Cons_Code: { type: "string" },
                        Active: { type: "string" },
                        Name: { type: "string" },
                        TOWNSHIPID: { type: "string" },
                        STANDID: { type: "string" },
                        METER_NUMBER: { type: "string" },
                        READING: { type: "string" },
                        CONDITION: { type: "string" },
                        RESIDENTS: { type: "string" },
                        WATER_SOURCE: { type: "string" },
                        ILLEGAL_CONNECTION_: { type: "string" },
                        BURST_PIPES__: { type: "string" },
                        TOILET_SEATS_: { type: "string" },
                        xCoordinate: { type: "number" },
                        yCoordinate: { type: "number" },
                        wkt: { type: "string" }
                    }
                }
            },
            change: function ( e )
            {
                console.log( "I was fired!!!!!" );
                var data = this.data();
                console.log( data.length );

                // TODO:Gets the data source from the grid.
                var dataSource = $( "#grid" ).data( "kendoGrid" ).dataSource;
                console.log( dataSource );
                // TODO:Gets the filter from the dataSource
                var filters = dataSource.filter();
                console.log( filters );
                // TODO:Gets the full set of data from the data source
                var allData = dataSource.data();
                console.log( allData );
                // TODO:Applies the filter to the data
                var query = new kendo.data.Query( allData );
                console.log( query );
                var filteredData = query.filter( filters ).data;
                console.log( filteredData );
                var wktext;
                map.eachLayer( function ( layer ){
                    map.removeLayer( layer );
                });
                esriWorldImagery.addTo(map);
                $( filteredData ).each( function ( index, item )
                {
                    wktext = item.wkt;
                    console.log( wktext );
                    omnivore.wkt.parse( wktext ).addTo( map );
                } );

            },
            serverPaging: true,
            serverSorting: true,
            serverFiltering: true,
            serverGrouping: true,
            serverAggregates: true,
            pageSize: 1000
        },
        columnMenu: true,
        pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 1000
        },
        resizable: true,
        groupable: true,
        navigatable: true,
        selectable: "single row",
        change: function ( e )
        {
            var selectedRows = this.select();
            var selectedDataItems = [];
            for ( var i = 0; i < selectedRows.length; i++ )
            {
                var dataItem = this.dataItem( selectedRows[i] );
                selectedDataItems.push( dataItem );

                var markerlatlng = L.latLng( dataItem.yCoordinate, dataItem.xCoordinate );
                map.setView( markerlatlng, 16 );
                L.circleMarker( markerlatlng, {
                    radius: 0.0,
                    fillColor: "",
                    color: "#000000",
                    weight: 0.1,
                    opacity: 0.2,
                    fillOpacity: 0
                } ).addTo( map )
                .bindPopup( '<table><tr><th scope="row">Account Number</th><td>' + dataItem.Account + '</td></tr><tr><th scope="row">Current Payment:</th><td> $' + dataItem.CurrentPayment + '</td></tr><tr><th scope="row">Total Amnt Due:</th><td> $' + dataItem.TOTAL + '</td></tr><tr><th scope="row">Dept:</th><td>' + dataItem.Dept + '</td></tr><tr><th scope="row">Cons Code:</th><td>' + dataItem.Cons_Code + '</td></tr><tr><th scope="row">Account Active:</th><td>' + dataItem.Active + '</td></tr><tr><th scope="row">Account Holder:</th><td>' + dataItem.Name + '</td></tr><tr><th scope="row">Township:</th><td> Mkoba' + " " + dataItem.TOWNSHIPID + '</td></tr><tr><th scope="row">GP Stand ID:</th><td>' + dataItem.STANDID + '</td></tr><tr><th scope="row">Meter Number:</th><td>' + dataItem.METER_NUMBER + '</td></tr><tr><th scope="row">Current Reading:</th><td>' + dataItem.READING + '</td></tr><tr><th scope="row">Meter Condition:</th><td>' + dataItem.CONDITION + '</td></tr><tr><th scope="row">Number of Residents:</th><td>' + dataItem.RESIDENTS + '</td></tr><tr><th scope="row">Water Source:</th><td>' + dataItem.WATER_SOURCE + '</td></tr><tr><th scope="row">Illegal Connection?:</th><td>' + dataItem.ILLEGAL_CONNECTION_ + '</td></tr><tr><th scope="row">Burst Pipes?:</th><td>' + dataItem.BURST_PIPES__ + '</td></tr><tr><th scope="row">Number of Toilet Seats:</th><td>' + dataItem.TOILET_SEATS_ + "</td></tr></table>" )
                .openPopup();
                map.panTo( markerlatlng, {
                    aminate: true,
                    duration: 1.0,
                    easeLinearity: 0.70
                } );
            }
        },
        sortable: {
            mode: "multiple"
        },
        filterable: true,
        scrollable: true
    } );
    $.getJSON( getIllegalCondition, function ( data )
    {
        var chartData = data;
        var height = 300;
        var width = 300;

        var arcRadius1 = [
        { inner: 0.6, outer: 1 },
        { inner: 0.65, outer: 0.95 },
        { inner: 0.70, outer: 0.90 },
        { inner: 0.75, outer: 0.85 },
        { inner: 0.80, outer: 0.80 }
        ];

        nv.addGraph( function ()
        {
            var chart = nv.models.pieChart()
            .x( function ( d ) { return d.key } )
            .y( function ( d ) { return d.y } )
            .width( width )
            .height( height )
            .arcsRadius( arcRadius1 )
            .showTooltipPercent( true );

            d3.select( "#pieChart" )
            .datum( chartData )
            .transition().duration( 1200 )
            .attr( "width", width )
            .attr( "height", height )
            .call( chart );

            // update chart data values randomly
            setInterval( function ()
            {
                chartData[0].y = Math.floor( Math.random() * 10 );
                chartData[1].y = Math.floor( Math.random() * 10 );
                chart.update();
            }, 40000 );

            return chart;
        } );

        nv.addGraph( function ()
        {
            var chart = nv.models.pieChart()
            .x( function ( d ) { return d.key } )
            .y( function ( d ) { return d.y } )
            .color( d3.scale.category20().range().slice( 8 ) )
            .growOnHover( true )
            .arcsRadius( arcRadius1 )
            .labelType( "value" )
            .width( width )
            .donut( true )
            .height( height );

            d3.select( "#donutChart" )
            .datum( chartData )
            .transition().duration( 1200 )
            .attr( "width", width )
            .attr( "height", height )
            .call( chart );

            // disable and enable some of the sections
            var is_disabled = false;
            setInterval( function ()
            {
                chart.dispatch.changeState( { disabled: { 2: !is_disabled, 4: !is_disabled } } );
                is_disabled = !is_disabled;
            }, 30000 );

            return chart;
        } );
    } );
    $.getJSON( getMeterCondition, function ( data )
    {
        var historicalBarChart = [
        {
            key: "Cumulative Return",
            values: data
        }
        ];
        nv.addGraph( function ()
        {
            var chart = nv.models.discreteBarChart()
            .x( function ( d ) { return d.label } )
            .y( function ( d ) { return d.value } )
            .staggerLabels( true )
            //.staggerLabels(historicalBarChart[0].values.length > 8)
            .showValues( true )
            .duration( 250 )
            ;

            d3.select( "#histogramChart svg" )
            .datum( historicalBarChart )
            .call( chart );

            nv.utils.windowResize( chart.update );
            return chart;
        } );
    } );
    $.getJSON( getIllegalCondition, function ( data )
    {
        var total = data[0].y + data[1].y;
        var assdv = data[0].y / total;
        var closdv = data[1].y / total;
        var assPerc = 100 * assdv;
        var closPerc = 100 * closdv;
        var chartdb = [
        { key: "Updated", y: Math.round( assPerc ) },
        { key: "Pending", y: Math.round( closPerc ) }
        ];
        var arcRadius1 = [
        { inner: 0.6, outer: 1 },
        { inner: 0.65, outer: 0.95 }
        ];

        var colors = ["green", "skyblue"];


        var height = 300;
        var width = 300;

        nv.addGraph( function ()
        {
            var chart = nv.models.pieChart()
            .x( function ( d ) { return d.key } )
            .y( function ( d ) { return d.y } )
            .donut( true )
            .showLabels( false )
            .color( colors )
            .width( width )
            .height( height )
            .growOnHover( true )
            .arcsRadius( arcRadius1 )
            .id( "donut1" ); // allow custom CSS for this one svg
            //chart.title("0%");
            chart.title( Math.round( closPerc ) + "%" );
            d3.select( "#progresDonut" )
            .datum( chartdb )
            .transition().duration( 1200 )
            .attr( "width", width )
            .attr( "height", height )
            .call( chart );

            return chart;

        } );

    } );
    raster_group.addTo( map );
    feature_group.addTo( map );
    var baseMaps = {
        'OSM BaseMap': basemap,
        'Cadastral Base': standsTileLayer,
        'ESRI Imagery': esriWorldImagery,
        'Map Quest Arial': mapQuestOpenAerial,
        'ESRI World': esriWorldStreetMap
    };
    var overlays = {
        'Cadastral Stands': geojsonCadaster,
        'Cadastral Base': standsTileLayer
    };
    L.control.layers( baseMaps, overlays, { collapsed: true } ).addTo( map );
    stackLayers();
    var title = new L.Control();
    title.onAdd = function ( map )
    {
        this._div = L.DomUtil.create( "div", "info" ); // create a div with a class "info"
        this.update();
        return this._div;
    };
    title.update = function ()
    {
        this._div.innerHTML = "<h2>Finance System Module</h2></br><h4>Pan map to desired location.</h4>";
    };
    title.addTo( map );
    var legend = L.control( {
        position: "topright"
    } );
    legend.onAdd = function ( map )
    {
        var div = L.DomUtil.create( "div", "info legend" );
        div.innerHTML = '<h3>Legend</h3><br/>' +
            '<table id="legendtable"><tr>' +
            '<th>Symbol</th>' +
            '<th>Meaning</th>' +
            '</tr>' +
            '<tr>' +
            '<td style="background-color: Darkorange;"></td>' +
            '<td>Not Working</td>' +
            '</tr>' +
            '<tr> ' +
            ' <td style="background-color: Green;"></td> ' +
            '<td>Working</td> ' +
            '</tr>' +
            ' <tr>' +
            '<td style="background-color: DarkRed;"></td>' +
            ' <td>NULL</td> ' +
            ' </tr>' +
            '<tr>' +
            ' <td style="background-color: Skyblue;"></td>' +
            ' <td>N/A</td>' +
            '</tr> ' +
            '</table>';
        return div;
    };
    //legend.addTo(map);
    map.on( "overlayadd", restackLayers );