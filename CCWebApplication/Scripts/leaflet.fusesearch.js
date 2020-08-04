
// From http://www.tutorialspoint.com/javascript/array_map.htm
if (!Array.prototype.map)
{
  Array.prototype.map = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun !== "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        res[i] = fun.call(thisp, this[i], i, this);
    }

    return res;
  };
}

L.Control.FuseSearch = L.Control.extend({
    
    includes: L.Mixin.Events,
    
    options: {
        position: 'topright',
        title: 'Search',
        panelTitle: '',
        placeholder: 'Search',
        caseSensitive: false,
        threshold: 0.5,
        maxResultLength: null,
        showResultFct: null,
        showInvisibleFeatures: true,
        animateLocation: true, //animate a circle over location found
        circleLocation: true, //draw a circle in location found
        markerLocation: false, //draw a marker in location found
        zoom: null,
        markerIcon: new L.Icon.Default(),//custom icon for maker location
        propertyLoc: 'loc'
    },
    
    initialize: function(options) {
        L.setOptions(this, options);
        this._panelOnLeftSide = (this.options.position.indexOf("left") !== -1);
    },
    
    onAdd: function(map) {
        this._map = map;
        var ctrl = this._createControl();
        this._createPanel(map);
        this._setEventListeners();
        map.invalidateSize();

        if (this.options.circleLocation || this.options.markerLocation || this.options.markerIcon)
            this._markerLoc = new L.Control.Search.Marker([0, 0], {
                showCircle: this.options.circleLocation,
                showMarker: this.options.markerLocation,
                icon: this.options.markerIcon
            });//see below
        map.on({
            // 		'layeradd': this._onLayerAddRemove,
            // 		'layerremove': this._onLayerAddRemove
            'resize': this._handleAutoresize
        }, this);
        return ctrl;
    },
    
    onRemove: function(map) {
        
        this.hidePanel(map);
        this._clearEventListeners();
        this._clearPanel(map);
        this._clearControl();
        
        return this;
    },
    
    _createControl: function() {

        var className = 'leaflet-fusesearch-control',
            container = L.DomUtil.create('div', className);

        // Control to open the search panel
        var butt = this._openButton = L.DomUtil.create('a', 'button', container);
        butt.href = '#';
        butt.title = this.options.title;
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent.on(butt, 'click', stop)
                  .on(butt, 'mousedown', stop)
                  .on(butt, 'touchstart', stop)
                  .on(butt, 'mousewheel', stop)
                  .on(butt, 'MozMousePixelScroll', stop);
        L.DomEvent.on(butt, 'click', L.DomEvent.preventDefault);
        L.DomEvent.on(butt, 'click', this.showPanel, this);

        return container;
    },
    
    _clearControl: function() {
        // Unregister events to prevent memory leak
        var butt = this._openButton;
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent.off(butt, 'click', stop)
                  .off(butt, 'mousedown', stop)
                  .off(butt, 'touchstart', stop)
                  .off(butt, 'mousewheel', stop)
                  .off(butt, 'MozMousePixelScroll', stop);
        L.DomEvent.off(butt, 'click', L.DomEvent.preventDefault);
        L.DomEvent.off(butt, 'click', this.showPanel);
    },
    
    _createPanel: function(map) {
        var _this = this;

        // Create the search panel
        var mapContainer = map.getContainer();
        var className = 'leaflet-fusesearch-panel',
            pane = this._panel = L.DomUtil.create('div', className, mapContainer);
        
        // Make sure we don't drag the map when we interact with the content
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent.on(pane, 'click', stop)
                  .on(pane, 'dblclick', stop)
                  .on(pane, 'mousedown', stop)
                  .on(pane, 'touchstart', stop)
                  .on(pane, 'mousewheel', stop)
                  .on(pane, 'MozMousePixelScroll', stop);

        // place the pane on the same side as the control
        if (this._panelOnLeftSide) {
            L.DomUtil.addClass(pane, 'left');
        } else {
            L.DomUtil.addClass(pane, 'right');
        }

        // Intermediate container to get the box sizing right
        var container = L.DomUtil.create('div', 'content', pane);
        
        var header = L.DomUtil.create('div', 'header', container);
        if (this.options.panelTitle) {
           var title = L.DomUtil.create('p', 'panel-title', header);
            title.innerHTML = this.options.panelTitle;
        }
        
        // Search image and input field
        L.DomUtil.create('img', 'search-image', header);
        this._input = L.DomUtil.create('input', 'search-input', header);
        this._input.maxLength = 30;
        this._input.placeholder = this.options.placeholder;
        this._input.onkeyup = function(evt) {
            var searchString = evt.currentTarget.value;
            _this.searchFeatures(searchString);
        };

        // Close button
        var close = this._closeButton = L.DomUtil.create('a', 'close', header);
        close.innerHTML = '&times;';
        L.DomEvent.on(close, 'click', this.hidePanel, this);
        
        // Where the result will be listed
        this._resultList = L.DomUtil.create('div', 'result-list', container); 
        
        return pane;
    },
    
    _clearPanel: function(map) {

        // Unregister event handlers
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent.off(this._panel, 'dblclick', stop)
                  .off(this._panel, 'mousedown', stop)
                  .off(this._panel, 'touchstart', stop)
                  .off(this._panel, 'mousewheel', stop)
                  .off(this._panel, 'MozMousePixelScroll', stop);

        L.DomEvent.off(this._closeButton, 'click', this.hidePanel);
        
        var mapContainer = map.getContainer();
        mapContainer.removeChild(this._panel);
        
        this._panel = null;
    },
    
    _setEventListeners : function() {
        var that = this;
        var input = this._input;
        this._map.addEventListener('overlayadd', function() {
            that.searchFeatures(input.value);
        });
        this._map.addEventListener('overlayremove', function() {
            that.searchFeatures(input.value);
        });
    },
    
    _clearEventListeners: function() {
        this._map.removeEventListener('overlayadd');
        this._map.removeEventListener('overlayremove');        
    },
    
    isPanelVisible: function () {
        return L.DomUtil.hasClass(this._panel, 'visible');
    },

    showPanel: function () {
        if (! this.isPanelVisible()) {
            L.DomUtil.addClass(this._panel, 'visible');
            // Preserve map centre
            this._map.panBy([this.getOffset() * 0.5, 0], {duration: 0.5});
            this.fire('show');
            this._input.select();
            // Search again as visibility of features might have changed
            this.searchFeatures(this._input.value);
        }
    },

    hidePanel: function (e) {
        if (this.isPanelVisible()) {
            L.DomUtil.removeClass(this._panel, 'visible');
            // Move back the map centre - only if we still hold this._map
            // as this might already have been cleared up by removeFrom()
            if (null !== this._map) {
                this._map.panBy([this.getOffset() * -0.5, 0], {duration: 0.5});
            };
            this.fire('hide');
            if(e) {
                L.DomEvent.stopPropagation(e);
            }
        }
    },
    
    getOffset: function() {
        if (this._panelOnLeftSide) {
            return - this._panel.offsetWidth;
        } else {
            return this._panel.offsetWidth;
        }
    },

    indexFeatures: function(data, keys) {

        var jsonFeatures = data.features || data;
        
        this._keys = keys;
        var properties = jsonFeatures.map(function(feature) {
            // Keep track of the original feature
            feature.properties._feature = feature;
            return feature.properties;
        });
        
        var options = {
            keys: keys,
            caseSensitive: this.options.caseSensitive,
            threshold : this.options.threshold
        };
        
        this._fuseIndex = new Fuse(properties, options);
    },
    
    searchFeatures: function(string) {
        
        var result = this._fuseIndex.search(string);

        // Empty result list
        var listItems = document.querySelectorAll(".result-item");
        for (var i = 0 ; i < listItems.length ; i++) {
            listItems[i].remove();
        }

        var resultList = document.querySelector('.result-list');
        var num = 0;
        var max = this.options.maxResultLength;
        for (var i in result) {
            var props = result[i];
            var feature = props._feature;
            var popup = this._getFeaturePopupIfVisible(feature);
            
            if (undefined !== popup || this.options.showInvisibleFeatures) {
                this.createResultItem(props, resultList, popup);
                if (undefined !== max && ++num === max)
                    break;
            }
        }
    },
    
    refresh: function() {
        // Reapply the search on the indexed features - useful if features have been filtered out
        if (this.isPanelVisible()) {
            this.searchFeatures(this._input.value);
        }
    },

    _getLocation: function (key) {	//extract latlng from _recordsCache

        if (this._recordsCache.hasOwnProperty(key))
            return this._recordsCache[key];//then after use .loc attribute
        else
            return false;
    },

    showLocation: function (latlng, title) {	//set location on map from _recordsCache

        if (this.options.zoom)
            this._map.setView(latlng, this.options.zoom);
        else
            this._map.panTo(latlng);

        if (this._markerLoc) {
            this._markerLoc.setLatLng(latlng);  //show circle/marker in location found
            this._markerLoc.setTitle(title);
            this._markerLoc.show();
            if (this.options.animateLocation)
                this._markerLoc.animate();
            //TODO showLocation: start animation after setView or panTo, maybe with map.on('moveend')...	
        }

        //FIXME autoCollapse option hide this._markerLoc before that visualized!!
        if (this.options.autoCollapse)
            this.collapse();
        return this;
    },
    
    _getFeaturePopupIfVisible: function(feature) {
        var layer = feature.layer;
        if (undefined !== layer && this._map.hasLayer(layer)) {
            return layer.getPopup();
        }
    },
    
    createResultItem: function(props, container, popup) {

        var _this = this;
        var feature = props._feature;

        // Create a container and open the associated popup on click
        var resultItem = L.DomUtil.create('div', 'result-item container', container);
        
        if (undefined !== popup) {
            L.DomUtil.addClass(resultItem, 'clickable');
            resultItem.onclick = function() {
                
                if (window.matchMedia("(max-width:480px)").matches) {
                    _this.hidePanel();
                    feature.layer.openPopup();
                    //L.Map.fitBounds(layer.feature.getBounds());
                    //feature.layer.latLngBounds()
                } else {

                    _this._panAndPopup(feature, popup);

                }                                        
            };
        }

        // Fill in the container with the user-supplied function if any,
        // otherwise display the feature properties used for the search.
        if (null !== this.options.showResultFct) {
            this.options.showResultFct(feature, resultItem);
        } else {
            str = '<b>' + props[this._keys[0]] + '</b>';
            for (var i = 1; i < this._keys.length; i++) {
                str += '<br/>' + props[this._keys[i]];
            }
            resultItem.innerHTML = str;
        };

        return resultItem;
    },
    
    _panAndPopup : function(feature, popup) {
        // Temporarily adapt the map padding so that the popup is not hidden by the search pane
        if (this._panelOnLeftSide) {
            var oldPadding = popup.options.autoPanPaddingTopLeft;
            var newPadding = new L.Point(- this.getOffset(), 10);
            popup.options.autoPanPaddingTopLeft = newPadding;
            feature.layer.openPopup();
            popup.options.autoPanPaddingTopLeft = oldPadding;
        } else {
            var oldPadding = popup.options.autoPanPaddingBottomRight;
            var newPadding = new L.Point(this.getOffset(), 10);
            popup.options.autoPanPaddingBottomRight = newPadding;
            feature.layer.openPopup();
            popup.options.autoPanPaddingBottomRight = oldPadding;
        }
    }


});
   L.Control.Search.Marker = L.Marker.extend({

        includes: L.Mixin.Events,

        options: {
            radius: 10,
            weight: 3,
            color: '#e03',
            stroke: true,
            fill: false,
            title: '',
            icon: new L.Icon.Default(),
            showCircle: true,
            showMarker: false	//show icon optional, show only circleLoc
        },

        initialize: function (latlng, options) {
            L.setOptions(this, options);
            L.Marker.prototype.initialize.call(this, latlng, options);
            if (this.options.showCircle)
                this._circleLoc = new L.CircleMarker(latlng, this.options);
        },

        onAdd: function (map) {
            L.Marker.prototype.onAdd.call(this, map);
            if (this._circleLoc)
                map.addLayer(this._circleLoc);
            this.hide();
        },

        onRemove: function (map) {
            L.Marker.prototype.onRemove.call(this, map);
            if (this._circleLoc)
                map.removeLayer(this._circleLoc);
        },

        setLatLng: function (latlng) {
            L.Marker.prototype.setLatLng.call(this, latlng);
            if (this._circleLoc)
                this._circleLoc.setLatLng(latlng);
            return this;
        },

        setTitle: function (title) {
            title = title || '';
            this.options.title = title;
            if (this._icon)
                this._icon.title = title;
            return this;
        },

        show: function () {
            if (this.options.showMarker) {
                if (this._icon)
                    this._icon.style.display = 'block';
                if (this._shadow)
                    this._shadow.style.display = 'block';
                //this._bringToFront();
            }
            if (this._circleLoc) {
                this._circleLoc.setStyle({ fill: this.options.fill, stroke: this.options.stroke });
                //this._circleLoc.bringToFront();
            }
            return this;
        },

        hide: function () {
            if (this._icon)
                this._icon.style.display = 'none';
            if (this._shadow)
                this._shadow.style.display = 'none';
            if (this._circleLoc)
                this._circleLoc.setStyle({ fill: false, stroke: false });
            return this;
        },

        animate: function () {
            //TODO refact animate() more smooth! like this: http://goo.gl/DDlRs
            if (this._circleLoc) {
                var circle = this._circleLoc,
                    tInt = 200,	//time interval
                    ss = 10,	//frames
                    mr = parseInt(circle._radius / ss),
                    oldrad = this.options.radius,
                    newrad = circle._radius * 2.5,
                    acc = 0;

                circle._timerAnimLoc = setInterval(function () {
                    acc += 0.5;
                    mr += acc;	//adding acceleration
                    newrad -= mr;

                    circle.setRadius(newrad);

                    if (newrad < oldrad) {
                        clearInterval(circle._timerAnimLoc);
                        circle.setRadius(oldrad);//reset radius
                        //if(typeof afterAnimCall == 'function')
                        //afterAnimCall();
                        //TODO use create event 'animateEnd' in L.Control.Search.Marker 
                    }
                }, tInt);
            }

            return this;
        }
    });

L.control.fuseSearch = function(options) {
    return new L.Control.FuseSearch(options);
};
