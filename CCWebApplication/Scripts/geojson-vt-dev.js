(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.geojsonvt = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = clip;

/* clip features between two axis-parallel lines:
 *     |        |
 *  ___|___     |     /
 * /   |   \____|____/
 *     |        |
 */

function clip(features, scale, k1, k2, axis, intersect, minAll, maxAll) {

    k1 /= scale;
    k2 /= scale;

    if (minAll >= k1 && maxAll <= k2) return features; // trivial accept
    else if (minAll > k2 || maxAll < k1) return null; // trivial reject

    var clipped = [];

    for (var i = 0; i < features.length; i++) {

        var feature = features[i],
            geometry = feature.geometry,
            type = feature.type,
            min, max;

        min = feature.min[axis];
        max = feature.max[axis];

        if (min >= k1 && max <= k2) { // trivial accept
            clipped.push(feature);
            continue;
        } else if (min > k2 || max < k1) continue; // trivial reject

        var slices = type === 1 ?
                clipPoints(geometry, k1, k2, axis) :
                clipGeometry(geometry, k1, k2, axis, intersect, type === 3);

        if (slices.length) {
            // if a feature got clipped, it will likely get clipped on the next zoom level as well,
            // so there's no need to recalculate bboxes
            clipped.push({
                geometry: slices,
                type: type,
                tags: features[i].tags || null,
                min: feature.min,
                max: feature.max
            });
        }
    }

    return clipped.length ? clipped : null;
}

function clipPoints(geometry, k1, k2, axis) {
    var slice = [];

    for (var i = 0; i < geometry.length; i++) {
        var a = geometry[i],
            ak = a[axis];

        if (ak >= k1 && ak <= k2) slice.push(a);
    }
    return slice;
}

function clipGeometry(geometry, k1, k2, axis, intersect, closed) {

    var slices = [];

    for (var i = 0; i < geometry.length; i++) {

        var ak = 0,
            bk = 0,
            b = null,
            points = geometry[i],
            area = points.area,
            dist = points.dist,
            len = points.length,
            a, j, last;

        var slice = [];

        for (j = 0; j < len - 1; j++) {
            a = b || points[j];
            b = points[j + 1];
            ak = bk || a[axis];
            bk = b[axis];

            if (ak < k1) {

                if ((bk > k2)) { // ---|-----|-->
                    slice.push(intersect(a, b, k1), intersect(a, b, k2));
                    if (!closed) slice = newSlice(slices, slice, area, dist);

                } else if (bk >= k1) slice.push(intersect(a, b, k1)); // ---|-->  |

            } else if (ak > k2) {

                if ((bk < k1)) { // <--|-----|---
                    slice.push(intersect(a, b, k2), intersect(a, b, k1));
                    if (!closed) slice = newSlice(slices, slice, area, dist);

                } else if (bk <= k2) slice.push(intersect(a, b, k2)); // |  <--|---

            } else {

                slice.push(a);

                if (bk < k1) { // <--|---  |
                    slice.push(intersect(a, b, k1));
                    if (!closed) slice = newSlice(slices, slice, area, dist);

                } else if (bk > k2) { // |  ---|-->
                    slice.push(intersect(a, b, k2));
                    if (!closed) slice = newSlice(slices, slice, area, dist);
                }
                // | --> |
            }
        }

        // add the last point
        a = points[len - 1];
        ak = a[axis];
        if (ak >= k1 && ak <= k2) slice.push(a);

        // close the polygon if its endpoints are not the same after clipping

        last = slice[slice.length - 1];
        if (closed && last && (slice[0][0] !== last[0] || slice[0][1] !== last[1])) slice.push(slice[0]);

        // add the final slice
        newSlice(slices, slice, area, dist);
    }

    return slices;
}

function newSlice(slices, slice, area, dist) {
    if (slice.length) {
        // we don't recalculate the area/length of the unclipped geometry because the case where it goes
        // below the visibility threshold as a result of clipping is rare, so we avoid doing unnecessary work
        slice.area = area;
        slice.dist = dist;

        slices.push(slice);
    }
    return [];
}

},{}],2:[function(require,module,exports){
'use strict';

module.exports = convert;

var simplify = require('./simplify');

// converts GeoJSON feature into an intermediate projected JSON vector format with simplification data

function convert(data, tolerance) {
    var features = [];

    if (data.type === 'FeatureCollection') {
        for (var i = 0; i < data.features.length; i++) {
            convertFeature(features, data.features[i], tolerance);
        }
    } else if (data.type === 'Feature') {
        convertFeature(features, data, tolerance);

    } else {
        // single geometry or a geometry collection
        convertFeature(features, {geometry: data}, tolerance);
    }
    return features;
}

function convertFeature(features, feature, tolerance) {
    var geom = feature.geometry,
        type = geom.type,
        coords = geom.coordinates,
        tags = feature.properties,
        i, j, rings;

    if (type === 'Point') {
        features.push(create(tags, 1, [projectPoint(coords)]));

    } else if (type === 'MultiPoint') {
        features.push(create(tags, 1, project(coords)));

    } else if (type === 'LineString') {
        features.push(create(tags, 2, [project(coords, tolerance)]));

    } else if (type === 'MultiLineString' || type === 'Polygon') {
        rings = [];
        for (i = 0; i < coords.length; i++) {
            rings.push(project(coords[i], tolerance));
        }
        features.push(create(tags, type === 'Polygon' ? 3 : 2, rings));

    } else if (type === 'MultiPolygon') {
        rings = [];
        for (i = 0; i < coords.length; i++) {
            for (j = 0; j < coords[i].length; j++) {
                rings.push(project(coords[i][j], tolerance));
            }
        }
        features.push(create(tags, 3, rings));

    } else if (type === 'GeometryCollection') {
        for (i = 0; i < geom.geometries.length; i++) {
            convertFeature(features, {
                geometry: geom.geometries[i],
                properties: tags
            }, tolerance);
        }

    } else {
        throw new Error('Input data is not a valid GeoJSON object.');
    }
}

function create(tags, type, geometry) {
    var feature = {
        geometry: geometry,
        type: type,
        tags: tags || null,
        min: [2, 1], // initial bbox values;
        max: [-1, 0]  // note that coords are usually in [0..1] range
    };
    calcBBox(feature);
    return feature;
}

function project(lonlats, tolerance) {
    var projected = [];
    for (var i = 0; i < lonlats.length; i++) {
        projected.push(projectPoint(lonlats[i]));
    }
    if (tolerance) {
        simplify(projected, tolerance);
        calcSize(projected);
    }
    return projected;
}

function projectPoint(p) {
    var sin = Math.sin(p[1] * Math.PI / 180),
        x = (p[0] / 360 + 0.5),
        y = (0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI);

    y = y < -1 ? -1 :
        y > 1 ? 1 : y;

    return [x, y, 0];
}

// calculate area and length of the poly
function calcSize(points) {
    var area = 0,
        dist = 0;

    for (var i = 0, a, b; i < points.length - 1; i++) {
        a = b || points[i];
        b = points[i + 1];

        area += a[0] * b[1] - b[0] * a[1];

        // use Manhattan distance instead of Euclidian one to avoid expensive square root computation
        dist += Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
    }
    points.area = Math.abs(area / 2);
    points.dist = dist;
}

// calculate the feature bounding box for faster clipping later
function calcBBox(feature) {
    var geometry = feature.geometry,
        min = feature.min,
        max = feature.max;

    if (feature.type === 1) calcRingBBox(min, max, geometry);
    else for (var i = 0; i < geometry.length; i++) calcRingBBox(min, max, geometry[i]);

    return feature;
}

function calcRingBBox(min, max, points) {
    for (var i = 0, p; i < points.length; i++) {
        p = points[i];
        min[0] = Math.min(p[0], min[0]);
        max[0] = Math.max(p[0], max[0]);
        min[1] = Math.min(p[1], min[1]);
        max[1] = Math.max(p[1], max[1]);
    }
}

},{"./simplify":4}],3:[function(require,module,exports){
'use strict';

module.exports = geojsonvt;

var convert = require('./convert'),     // GeoJSON conversion and preprocessing
    transform = require('./transform'), // coordinate transformation
    clip = require('./clip'),           // stripe clipping algorithm
    wrap = require('./wrap'),           // date line processing
    createTile = require('./tile');     // final simplified tile generation


function geojsonvt(data, options) {
    return new GeoJSONVT(data, options);
}

function GeoJSONVT(data, options) {
    options = this.options = extend(Object.create(this.options), options);

    var debug = options.debug;

    if (debug) console.time('preprocess data');

    var z2 = 1 << options.maxZoom, // 2^z
        features = convert(data, options.tolerance / (z2 * options.extent));

    this.tiles = {};
    this.tileCoords = [];

    if (debug) {
        console.timeEnd('preprocess data');
        console.log('index: maxZoom: %d, maxPoints: %d', options.indexMaxZoom, options.indexMaxPoints);
        console.time('generate tiles');
        this.stats = {};
        this.total = 0;
    }

    features = wrap(features, options.buffer / options.extent, intersectX);

    // start slicing from the top tile down
    if (features.length) this.splitTile(features, 0, 0, 0);

    if (debug) {
        if (features.length) console.log('features: %d, points: %d', this.tiles[0].numFeatures, this.tiles[0].numPoints);
        console.timeEnd('generate tiles');
        console.log('tiles generated:', this.total, JSON.stringify(this.stats));
    }
}

GeoJSONVT.prototype.options = {
    maxZoom: 14,            // max zoom to preserve detail on
    indexMaxZoom: 5,        // max zoom in the tile index
    indexMaxPoints: 100000, // max number of points per tile in the tile index
    solidChildren: false,   // whether to tile solid square tiles further
    tolerance: 3,           // simplification tolerance (higher means simpler)
    extent: 4096,           // tile extent
    buffer: 64,             // tile buffer on each side
    debug: 0                // logging level (0, 1 or 2)
};

GeoJSONVT.prototype.splitTile = function (features, z, x, y, cz, cx, cy) {

    var stack = [features, z, x, y],
        options = this.options,
        debug = options.debug,
        solid = null;

    // avoid recursion by using a processing queue
    while (stack.length) {
        y = stack.pop();
        x = stack.pop();
        z = stack.pop();
        features = stack.pop();

        var z2 = 1 << z,
            id = toID(z, x, y),
            tile = this.tiles[id],
            tileTolerance = z === options.maxZoom ? 0 : options.tolerance / (z2 * options.extent);

        if (!tile) {
            if (debug > 1) console.time('creation');

            tile = this.tiles[id] = createTile(features, z2, x, y, tileTolerance, z === options.maxZoom);
            this.tileCoords.push({z: z, x: x, y: y});

            if (debug) {
                if (debug > 1) {
                    console.log('tile z%d-%d-%d (features: %d, points: %d, simplified: %d)',
                        z, x, y, tile.numFeatures, tile.numPoints, tile.numSimplified);
                    console.timeEnd('creation');
                }
                var key = 'z' + z;
                this.stats[key] = (this.stats[key] || 0) + 1;
                this.total++;
            }
        }

        // save reference to original geometry in tile so that we can drill down later if we stop now
        tile.source = features;

        // if it's the first-pass tiling
        if (!cz) {
            // stop tiling if we reached max zoom, or if the tile is too simple
            if (z === options.indexMaxZoom || tile.numPoints <= options.indexMaxPoints) continue;

        // if a drilldown to a specific tile
        } else {
            // stop tiling if we reached base zoom or our target tile zoom
            if (z === options.maxZoom || z === cz) continue;

            // stop tiling if it's not an ancestor of the target tile
            var m = 1 << (cz - z);
            if (x !== Math.floor(cx / m) || y !== Math.floor(cy / m)) continue;
        }

        // stop tiling if the tile is solid clipped square
        if (!options.solidChildren && isClippedSquare(tile, options.extent, options.buffer)) {
            if (cz) solid = z; // and remember the zoom if we're drilling down
            continue;
        }

        // if we slice further down, no need to keep source geometry
        tile.source = null;

        if (debug > 1) console.time('clipping');

        // values we'll use for clipping
        var k1 = 0.5 * options.buffer / options.extent,
            k2 = 0.5 - k1,
            k3 = 0.5 + k1,
            k4 = 1 + k1,
            tl, bl, tr, br, left, right;

        tl = bl = tr = br = null;

        left  = clip(features, z2, x - k1, x + k3, 0, intersectX, tile.min[0], tile.max[0]);
        right = clip(features, z2, x + k2, x + k4, 0, intersectX, tile.min[0], tile.max[0]);

        if (left) {
            tl = clip(left, z2, y - k1, y + k3, 1, intersectY, tile.min[1], tile.max[1]);
            bl = clip(left, z2, y + k2, y + k4, 1, intersectY, tile.min[1], tile.max[1]);
        }

        if (right) {
            tr = clip(right, z2, y - k1, y + k3, 1, intersectY, tile.min[1], tile.max[1]);
            br = clip(right, z2, y + k2, y + k4, 1, intersectY, tile.min[1], tile.max[1]);
        }

        if (debug > 1) console.timeEnd('clipping');

        if (tl) stack.push(tl, z + 1, x * 2,     y * 2);
        if (bl) stack.push(bl, z + 1, x * 2,     y * 2 + 1);
        if (tr) stack.push(tr, z + 1, x * 2 + 1, y * 2);
        if (br) stack.push(br, z + 1, x * 2 + 1, y * 2 + 1);
    }

    return solid;
};

GeoJSONVT.prototype.getTile = function (z, x, y) {
    var options = this.options,
        extent = options.extent,
        debug = options.debug;

    var z2 = 1 << z;
    x = ((x % z2) + z2) % z2; // wrap tile x coordinate

    var id = toID(z, x, y);
    if (this.tiles[id]) return transform.tile(this.tiles[id], extent);

    if (debug > 1) console.log('drilling down to z%d-%d-%d', z, x, y);

    var z0 = z,
        x0 = x,
        y0 = y,
        parent;

    while (!parent && z0 > 0) {
        z0--;
        x0 = Math.floor(x0 / 2);
        y0 = Math.floor(y0 / 2);
        parent = this.tiles[toID(z0, x0, y0)];
    }

    if (!parent || !parent.source) return null;

    // if we found a parent tile containing the original geometry, we can drill down from it
    if (debug > 1) console.log('found parent tile z%d-%d-%d', z0, x0, y0);

    // it parent tile is a solid clipped square, return it instead since it's identical
    if (isClippedSquare(parent, extent, options.buffer)) return transform.tile(parent, extent);

    if (debug > 1) console.time('drilling down');
    var solid = this.splitTile(parent.source, z0, x0, y0, z, x, y);
    if (debug > 1) console.timeEnd('drilling down');

    // one of the parent tiles was a solid clipped square
    if (solid !== null) {
        var m = 1 << (z - solid);
        id = toID(solid, Math.floor(x / m), Math.floor(y / m));
    }

    return this.tiles[id] ? transform.tile(this.tiles[id], extent) : null;
};

function toID(z, x, y) {
    return (((1 << z) * y + x) * 32) + z;
}

function intersectX(a, b, x) {
    return [x, (x - a[0]) * (b[1] - a[1]) / (b[0] - a[0]) + a[1], 1];
}
function intersectY(a, b, y) {
    return [(y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]) + a[0], y, 1];
}

function extend(dest, src) {
    for (var i in src) dest[i] = src[i];
    return dest;
}

// checks whether a tile is a whole-area fill after clipping; if it is, there's no sense slicing it further
function isClippedSquare(tile, extent, buffer) {

    var features = tile.source;
    if (features.length !== 1) return false;

    var feature = features[0];
    if (feature.type !== 3 || feature.geometry.length > 1) return false;

    var len = feature.geometry[0].length;
    if (len !== 5) return false;

    for (var i = 0; i < len; i++) {
        var p = transform.point(feature.geometry[0][i], extent, tile.z2, tile.x, tile.y);
        if ((p[0] !== -buffer && p[0] !== extent + buffer) ||
            (p[1] !== -buffer && p[1] !== extent + buffer)) return false;
    }

    return true;
}

},{"./clip":1,"./convert":2,"./tile":5,"./transform":6,"./wrap":7}],4:[function(require,module,exports){
'use strict';

module.exports = simplify;

// calculate simplification data using optimized Douglas-Peucker algorithm

function simplify(points, tolerance) {

    var sqTolerance = tolerance * tolerance,
        len = points.length,
        first = 0,
        last = len - 1,
        stack = [],
        i, maxSqDist, sqDist, index;

    // always retain the endpoints (1 is the max value)
    points[first][2] = 1;
    points[last][2] = 1;

    // avoid recursion by using a stack
    while (last) {

        maxSqDist = 0;

        for (i = first + 1; i < last; i++) {
            sqDist = getSqSegDist(points[i], points[first], points[last]);

            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > sqTolerance) {
            points[index][2] = maxSqDist; // save the point importance in squared pixels as a z coordinate
            stack.push(first);
            stack.push(index);
            first = index;

        } else {
            last = stack.pop();
            first = stack.pop();
        }
    }
}

// square distance from a point to a segment
function getSqSegDist(p, a, b) {

    var x = a[0], y = a[1],
        bx = b[0], by = b[1],
        px = p[0], py = p[1],
        dx = bx - x,
        dy = by - y;

    if (dx !== 0 || dy !== 0) {

        var t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = bx;
            y = by;

        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = px - x;
    dy = py - y;

    return dx * dx + dy * dy;
}

},{}],5:[function(require,module,exports){
'use strict';

module.exports = createTile;

function createTile(features, z2, tx, ty, tolerance, noSimplify) {
    var tile = {
        features: [],
        numPoints: 0,
        numSimplified: 0,
        numFeatures: 0,
        source: null,
        x: tx,
        y: ty,
        z2: z2,
        transformed: false,
        min: [2, 1],
        max: [-1, 0]
    };
    for (var i = 0; i < features.length; i++) {
        tile.numFeatures++;
        addFeature(tile, features[i], tolerance, noSimplify);

        var min = features[i].min,
            max = features[i].max;

        if (min[0] < tile.min[0]) tile.min[0] = min[0];
        if (min[1] < tile.min[1]) tile.min[1] = min[1];
        if (max[0] > tile.max[0]) tile.max[0] = max[0];
        if (max[1] > tile.max[1]) tile.max[1] = max[1];
    }
    return tile;
}

function addFeature(tile, feature, tolerance, noSimplify) {

    var geom = feature.geometry,
        type = feature.type,
        simplified = [],
        sqTolerance = tolerance * tolerance,
        i, j, ring, p;

    if (type === 1) {
        for (i = 0; i < geom.length; i++) {
            simplified.push(geom[i]);
            tile.numPoints++;
            tile.numSimplified++;
        }

    } else {

        // simplify and transform projected coordinates for tile geometry
        for (i = 0; i < geom.length; i++) {
            ring = geom[i];

            // filter out tiny polylines & polygons
            if (!noSimplify && ((type === 2 && ring.dist < tolerance) ||
                                (type === 3 && ring.area < sqTolerance))) {
                tile.numPoints += ring.length;
                continue;
            }

            var simplifiedRing = [];

            for (j = 0; j < ring.length; j++) {
                p = ring[j];
                // keep points with importance > tolerance
                if (noSimplify || p[2] > sqTolerance) {
                    simplifiedRing.push(p);
                    tile.numSimplified++;
                }
                tile.numPoints++;
            }

            simplified.push(simplifiedRing);
        }
    }

    if (simplified.length) {
        tile.features.push({
            geometry: simplified,
            type: type,
            tags: feature.tags || null
        });
    }
}

},{}],6:[function(require,module,exports){
'use strict';

exports.tile = transformTile;
exports.point = transformPoint;

// Transforms the coordinates of each feature in the given tile from
// mercator-projected space into (extent x extent) tile space.
function transformTile(tile, extent) {
    if (tile.transformed) return tile;

    var z2 = tile.z2,
        tx = tile.x,
        ty = tile.y,
        i, j, k;

    for (i = 0; i < tile.features.length; i++) {
        var feature = tile.features[i],
            geom = feature.geometry,
            type = feature.type;

        if (type === 1) {
            for (j = 0; j < geom.length; j++) geom[j] = transformPoint(geom[j], extent, z2, tx, ty);

        } else {
            for (j = 0; j < geom.length; j++) {
                var ring = geom[j];
                for (k = 0; k < ring.length; k++) ring[k] = transformPoint(ring[k], extent, z2, tx, ty);
            }
        }
    }

    tile.transformed = true;

    return tile;
}

function transformPoint(p, extent, z2, tx, ty) {
    var x = Math.round(extent * (p[0] * z2 - tx)),
        y = Math.round(extent * (p[1] * z2 - ty));
    return [x, y];
}

},{}],7:[function(require,module,exports){
'use strict';

var clip = require('./clip');

module.exports = wrap;

function wrap(features, buffer, intersectX) {
    var merged = features,
        left  = clip(features, 1, -1 - buffer, buffer,     0, intersectX, -1, 2), // left world copy
        right = clip(features, 1,  1 - buffer, 2 + buffer, 0, intersectX, -1, 2); // right world copy

    if (left || right) {
        merged = clip(features, 1, -buffer, 1 + buffer, 0, intersectX, -1, 2); // center world copy

        if (left) merged = shiftFeatureCoords(left, 1).concat(merged); // merge left into center
        if (right) merged = merged.concat(shiftFeatureCoords(right, -1)); // merge right into center
    }

    return merged;
}

function shiftFeatureCoords(features, offset) {
    var newFeatures = [];

    for (var i = 0; i < features.length; i++) {
        var feature = features[i],
            type = feature.type;

        var newGeometry;

        if (type === 1) {
            newGeometry = shiftCoords(feature.geometry, offset);
        } else {
            newGeometry = [];
            for (var j = 0; j < feature.geometry.length; j++) {
                newGeometry.push(shiftCoords(feature.geometry[j], offset));
            }
        }

        newFeatures.push({
            geometry: newGeometry,
            type: type,
            tags: feature.tags,
            min: [feature.min[0] + offset, feature.min[1]],
            max: [feature.max[0] + offset, feature.max[1]]
        });
    }

    return newFeatures;
}

function shiftCoords(points, offset) {
    var newPoints = [];
    newPoints.area = points.area;
    newPoints.dist = points.dist;

    for (var i = 0; i < points.length; i++) {
        newPoints.push([points[i][0] + offset, points[i][1], points[i][2]]);
    }
    return newPoints;
}

},{"./clip":1}]},{},[3])(3)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1VzZXJzL2dpc2tvbnN1bHQvQXBwRGF0YS9Sb2FtaW5nL25wbS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2NsaXAuanMiLCJzcmMvY29udmVydC5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9zaW1wbGlmeS5qcyIsInNyYy90aWxlLmpzIiwic3JjL3RyYW5zZm9ybS5qcyIsInNyYy93cmFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gY2xpcDtcblxuLyogY2xpcCBmZWF0dXJlcyBiZXR3ZWVuIHR3byBheGlzLXBhcmFsbGVsIGxpbmVzOlxuICogICAgIHwgICAgICAgIHxcbiAqICBfX198X19fICAgICB8ICAgICAvXG4gKiAvICAgfCAgIFxcX19fX3xfX19fL1xuICogICAgIHwgICAgICAgIHxcbiAqL1xuXG5mdW5jdGlvbiBjbGlwKGZlYXR1cmVzLCBzY2FsZSwgazEsIGsyLCBheGlzLCBpbnRlcnNlY3QsIG1pbkFsbCwgbWF4QWxsKSB7XG5cbiAgICBrMSAvPSBzY2FsZTtcbiAgICBrMiAvPSBzY2FsZTtcblxuICAgIGlmIChtaW5BbGwgPj0gazEgJiYgbWF4QWxsIDw9IGsyKSByZXR1cm4gZmVhdHVyZXM7IC8vIHRyaXZpYWwgYWNjZXB0XG4gICAgZWxzZSBpZiAobWluQWxsID4gazIgfHwgbWF4QWxsIDwgazEpIHJldHVybiBudWxsOyAvLyB0cml2aWFsIHJlamVjdFxuXG4gICAgdmFyIGNsaXBwZWQgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmVhdHVyZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICB2YXIgZmVhdHVyZSA9IGZlYXR1cmVzW2ldLFxuICAgICAgICAgICAgZ2VvbWV0cnkgPSBmZWF0dXJlLmdlb21ldHJ5LFxuICAgICAgICAgICAgdHlwZSA9IGZlYXR1cmUudHlwZSxcbiAgICAgICAgICAgIG1pbiwgbWF4O1xuXG4gICAgICAgIG1pbiA9IGZlYXR1cmUubWluW2F4aXNdO1xuICAgICAgICBtYXggPSBmZWF0dXJlLm1heFtheGlzXTtcblxuICAgICAgICBpZiAobWluID49IGsxICYmIG1heCA8PSBrMikgeyAvLyB0cml2aWFsIGFjY2VwdFxuICAgICAgICAgICAgY2xpcHBlZC5wdXNoKGZlYXR1cmUpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gZWxzZSBpZiAobWluID4gazIgfHwgbWF4IDwgazEpIGNvbnRpbnVlOyAvLyB0cml2aWFsIHJlamVjdFxuXG4gICAgICAgIHZhciBzbGljZXMgPSB0eXBlID09PSAxID9cbiAgICAgICAgICAgICAgICBjbGlwUG9pbnRzKGdlb21ldHJ5LCBrMSwgazIsIGF4aXMpIDpcbiAgICAgICAgICAgICAgICBjbGlwR2VvbWV0cnkoZ2VvbWV0cnksIGsxLCBrMiwgYXhpcywgaW50ZXJzZWN0LCB0eXBlID09PSAzKTtcblxuICAgICAgICBpZiAoc2xpY2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gaWYgYSBmZWF0dXJlIGdvdCBjbGlwcGVkLCBpdCB3aWxsIGxpa2VseSBnZXQgY2xpcHBlZCBvbiB0aGUgbmV4dCB6b29tIGxldmVsIGFzIHdlbGwsXG4gICAgICAgICAgICAvLyBzbyB0aGVyZSdzIG5vIG5lZWQgdG8gcmVjYWxjdWxhdGUgYmJveGVzXG4gICAgICAgICAgICBjbGlwcGVkLnB1c2goe1xuICAgICAgICAgICAgICAgIGdlb21ldHJ5OiBzbGljZXMsXG4gICAgICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgICAgICB0YWdzOiBmZWF0dXJlc1tpXS50YWdzIHx8IG51bGwsXG4gICAgICAgICAgICAgICAgbWluOiBmZWF0dXJlLm1pbixcbiAgICAgICAgICAgICAgICBtYXg6IGZlYXR1cmUubWF4XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjbGlwcGVkLmxlbmd0aCA/IGNsaXBwZWQgOiBudWxsO1xufVxuXG5mdW5jdGlvbiBjbGlwUG9pbnRzKGdlb21ldHJ5LCBrMSwgazIsIGF4aXMpIHtcbiAgICB2YXIgc2xpY2UgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2VvbWV0cnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGEgPSBnZW9tZXRyeVtpXSxcbiAgICAgICAgICAgIGFrID0gYVtheGlzXTtcblxuICAgICAgICBpZiAoYWsgPj0gazEgJiYgYWsgPD0gazIpIHNsaWNlLnB1c2goYSk7XG4gICAgfVxuICAgIHJldHVybiBzbGljZTtcbn1cblxuZnVuY3Rpb24gY2xpcEdlb21ldHJ5KGdlb21ldHJ5LCBrMSwgazIsIGF4aXMsIGludGVyc2VjdCwgY2xvc2VkKSB7XG5cbiAgICB2YXIgc2xpY2VzID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdlb21ldHJ5Lmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgdmFyIGFrID0gMCxcbiAgICAgICAgICAgIGJrID0gMCxcbiAgICAgICAgICAgIGIgPSBudWxsLFxuICAgICAgICAgICAgcG9pbnRzID0gZ2VvbWV0cnlbaV0sXG4gICAgICAgICAgICBhcmVhID0gcG9pbnRzLmFyZWEsXG4gICAgICAgICAgICBkaXN0ID0gcG9pbnRzLmRpc3QsXG4gICAgICAgICAgICBsZW4gPSBwb2ludHMubGVuZ3RoLFxuICAgICAgICAgICAgYSwgaiwgbGFzdDtcblxuICAgICAgICB2YXIgc2xpY2UgPSBbXTtcblxuICAgICAgICBmb3IgKGogPSAwOyBqIDwgbGVuIC0gMTsgaisrKSB7XG4gICAgICAgICAgICBhID0gYiB8fCBwb2ludHNbal07XG4gICAgICAgICAgICBiID0gcG9pbnRzW2ogKyAxXTtcbiAgICAgICAgICAgIGFrID0gYmsgfHwgYVtheGlzXTtcbiAgICAgICAgICAgIGJrID0gYltheGlzXTtcblxuICAgICAgICAgICAgaWYgKGFrIDwgazEpIHtcblxuICAgICAgICAgICAgICAgIGlmICgoYmsgPiBrMikpIHsgLy8gLS0tfC0tLS0tfC0tPlxuICAgICAgICAgICAgICAgICAgICBzbGljZS5wdXNoKGludGVyc2VjdChhLCBiLCBrMSksIGludGVyc2VjdChhLCBiLCBrMikpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNsb3NlZCkgc2xpY2UgPSBuZXdTbGljZShzbGljZXMsIHNsaWNlLCBhcmVhLCBkaXN0KTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYmsgPj0gazEpIHNsaWNlLnB1c2goaW50ZXJzZWN0KGEsIGIsIGsxKSk7IC8vIC0tLXwtLT4gIHxcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChhayA+IGsyKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoKGJrIDwgazEpKSB7IC8vIDwtLXwtLS0tLXwtLS1cbiAgICAgICAgICAgICAgICAgICAgc2xpY2UucHVzaChpbnRlcnNlY3QoYSwgYiwgazIpLCBpbnRlcnNlY3QoYSwgYiwgazEpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjbG9zZWQpIHNsaWNlID0gbmV3U2xpY2Uoc2xpY2VzLCBzbGljZSwgYXJlYSwgZGlzdCk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJrIDw9IGsyKSBzbGljZS5wdXNoKGludGVyc2VjdChhLCBiLCBrMikpOyAvLyB8ICA8LS18LS0tXG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBzbGljZS5wdXNoKGEpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGJrIDwgazEpIHsgLy8gPC0tfC0tLSAgfFxuICAgICAgICAgICAgICAgICAgICBzbGljZS5wdXNoKGludGVyc2VjdChhLCBiLCBrMSkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNsb3NlZCkgc2xpY2UgPSBuZXdTbGljZShzbGljZXMsIHNsaWNlLCBhcmVhLCBkaXN0KTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYmsgPiBrMikgeyAvLyB8ICAtLS18LS0+XG4gICAgICAgICAgICAgICAgICAgIHNsaWNlLnB1c2goaW50ZXJzZWN0KGEsIGIsIGsyKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY2xvc2VkKSBzbGljZSA9IG5ld1NsaWNlKHNsaWNlcywgc2xpY2UsIGFyZWEsIGRpc3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyB8IC0tPiB8XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhZGQgdGhlIGxhc3QgcG9pbnRcbiAgICAgICAgYSA9IHBvaW50c1tsZW4gLSAxXTtcbiAgICAgICAgYWsgPSBhW2F4aXNdO1xuICAgICAgICBpZiAoYWsgPj0gazEgJiYgYWsgPD0gazIpIHNsaWNlLnB1c2goYSk7XG5cbiAgICAgICAgLy8gY2xvc2UgdGhlIHBvbHlnb24gaWYgaXRzIGVuZHBvaW50cyBhcmUgbm90IHRoZSBzYW1lIGFmdGVyIGNsaXBwaW5nXG5cbiAgICAgICAgbGFzdCA9IHNsaWNlW3NsaWNlLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAoY2xvc2VkICYmIGxhc3QgJiYgKHNsaWNlWzBdWzBdICE9PSBsYXN0WzBdIHx8IHNsaWNlWzBdWzFdICE9PSBsYXN0WzFdKSkgc2xpY2UucHVzaChzbGljZVswXSk7XG5cbiAgICAgICAgLy8gYWRkIHRoZSBmaW5hbCBzbGljZVxuICAgICAgICBuZXdTbGljZShzbGljZXMsIHNsaWNlLCBhcmVhLCBkaXN0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2xpY2VzO1xufVxuXG5mdW5jdGlvbiBuZXdTbGljZShzbGljZXMsIHNsaWNlLCBhcmVhLCBkaXN0KSB7XG4gICAgaWYgKHNsaWNlLmxlbmd0aCkge1xuICAgICAgICAvLyB3ZSBkb24ndCByZWNhbGN1bGF0ZSB0aGUgYXJlYS9sZW5ndGggb2YgdGhlIHVuY2xpcHBlZCBnZW9tZXRyeSBiZWNhdXNlIHRoZSBjYXNlIHdoZXJlIGl0IGdvZXNcbiAgICAgICAgLy8gYmVsb3cgdGhlIHZpc2liaWxpdHkgdGhyZXNob2xkIGFzIGEgcmVzdWx0IG9mIGNsaXBwaW5nIGlzIHJhcmUsIHNvIHdlIGF2b2lkIGRvaW5nIHVubmVjZXNzYXJ5IHdvcmtcbiAgICAgICAgc2xpY2UuYXJlYSA9IGFyZWE7XG4gICAgICAgIHNsaWNlLmRpc3QgPSBkaXN0O1xuXG4gICAgICAgIHNsaWNlcy5wdXNoKHNsaWNlKTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnZlcnQ7XG5cbnZhciBzaW1wbGlmeSA9IHJlcXVpcmUoJy4vc2ltcGxpZnknKTtcblxuLy8gY29udmVydHMgR2VvSlNPTiBmZWF0dXJlIGludG8gYW4gaW50ZXJtZWRpYXRlIHByb2plY3RlZCBKU09OIHZlY3RvciBmb3JtYXQgd2l0aCBzaW1wbGlmaWNhdGlvbiBkYXRhXG5cbmZ1bmN0aW9uIGNvbnZlcnQoZGF0YSwgdG9sZXJhbmNlKSB7XG4gICAgdmFyIGZlYXR1cmVzID0gW107XG5cbiAgICBpZiAoZGF0YS50eXBlID09PSAnRmVhdHVyZUNvbGxlY3Rpb24nKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5mZWF0dXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29udmVydEZlYXR1cmUoZmVhdHVyZXMsIGRhdGEuZmVhdHVyZXNbaV0sIHRvbGVyYW5jZSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gJ0ZlYXR1cmUnKSB7XG4gICAgICAgIGNvbnZlcnRGZWF0dXJlKGZlYXR1cmVzLCBkYXRhLCB0b2xlcmFuY2UpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gc2luZ2xlIGdlb21ldHJ5IG9yIGEgZ2VvbWV0cnkgY29sbGVjdGlvblxuICAgICAgICBjb252ZXJ0RmVhdHVyZShmZWF0dXJlcywge2dlb21ldHJ5OiBkYXRhfSwgdG9sZXJhbmNlKTtcbiAgICB9XG4gICAgcmV0dXJuIGZlYXR1cmVzO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0RmVhdHVyZShmZWF0dXJlcywgZmVhdHVyZSwgdG9sZXJhbmNlKSB7XG4gICAgdmFyIGdlb20gPSBmZWF0dXJlLmdlb21ldHJ5LFxuICAgICAgICB0eXBlID0gZ2VvbS50eXBlLFxuICAgICAgICBjb29yZHMgPSBnZW9tLmNvb3JkaW5hdGVzLFxuICAgICAgICB0YWdzID0gZmVhdHVyZS5wcm9wZXJ0aWVzLFxuICAgICAgICBpLCBqLCByaW5ncztcblxuICAgIGlmICh0eXBlID09PSAnUG9pbnQnKSB7XG4gICAgICAgIGZlYXR1cmVzLnB1c2goY3JlYXRlKHRhZ3MsIDEsIFtwcm9qZWN0UG9pbnQoY29vcmRzKV0pKTtcblxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ011bHRpUG9pbnQnKSB7XG4gICAgICAgIGZlYXR1cmVzLnB1c2goY3JlYXRlKHRhZ3MsIDEsIHByb2plY3QoY29vcmRzKSkpO1xuXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnTGluZVN0cmluZycpIHtcbiAgICAgICAgZmVhdHVyZXMucHVzaChjcmVhdGUodGFncywgMiwgW3Byb2plY3QoY29vcmRzLCB0b2xlcmFuY2UpXSkpO1xuXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnTXVsdGlMaW5lU3RyaW5nJyB8fCB0eXBlID09PSAnUG9seWdvbicpIHtcbiAgICAgICAgcmluZ3MgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcmluZ3MucHVzaChwcm9qZWN0KGNvb3Jkc1tpXSwgdG9sZXJhbmNlKSk7XG4gICAgICAgIH1cbiAgICAgICAgZmVhdHVyZXMucHVzaChjcmVhdGUodGFncywgdHlwZSA9PT0gJ1BvbHlnb24nID8gMyA6IDIsIHJpbmdzKSk7XG5cbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdNdWx0aVBvbHlnb24nKSB7XG4gICAgICAgIHJpbmdzID0gW107XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBjb29yZHNbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICByaW5ncy5wdXNoKHByb2plY3QoY29vcmRzW2ldW2pdLCB0b2xlcmFuY2UpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmZWF0dXJlcy5wdXNoKGNyZWF0ZSh0YWdzLCAzLCByaW5ncykpO1xuXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnR2VvbWV0cnlDb2xsZWN0aW9uJykge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZ2VvbS5nZW9tZXRyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb252ZXJ0RmVhdHVyZShmZWF0dXJlcywge1xuICAgICAgICAgICAgICAgIGdlb21ldHJ5OiBnZW9tLmdlb21ldHJpZXNbaV0sXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogdGFnc1xuICAgICAgICAgICAgfSwgdG9sZXJhbmNlKTtcbiAgICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnB1dCBkYXRhIGlzIG5vdCBhIHZhbGlkIEdlb0pTT04gb2JqZWN0LicpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlKHRhZ3MsIHR5cGUsIGdlb21ldHJ5KSB7XG4gICAgdmFyIGZlYXR1cmUgPSB7XG4gICAgICAgIGdlb21ldHJ5OiBnZW9tZXRyeSxcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgdGFnczogdGFncyB8fCBudWxsLFxuICAgICAgICBtaW46IFsyLCAxXSwgLy8gaW5pdGlhbCBiYm94IHZhbHVlcztcbiAgICAgICAgbWF4OiBbLTEsIDBdICAvLyBub3RlIHRoYXQgY29vcmRzIGFyZSB1c3VhbGx5IGluIFswLi4xXSByYW5nZVxuICAgIH07XG4gICAgY2FsY0JCb3goZmVhdHVyZSk7XG4gICAgcmV0dXJuIGZlYXR1cmU7XG59XG5cbmZ1bmN0aW9uIHByb2plY3QobG9ubGF0cywgdG9sZXJhbmNlKSB7XG4gICAgdmFyIHByb2plY3RlZCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9ubGF0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwcm9qZWN0ZWQucHVzaChwcm9qZWN0UG9pbnQobG9ubGF0c1tpXSkpO1xuICAgIH1cbiAgICBpZiAodG9sZXJhbmNlKSB7XG4gICAgICAgIHNpbXBsaWZ5KHByb2plY3RlZCwgdG9sZXJhbmNlKTtcbiAgICAgICAgY2FsY1NpemUocHJvamVjdGVkKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb2plY3RlZDtcbn1cblxuZnVuY3Rpb24gcHJvamVjdFBvaW50KHApIHtcbiAgICB2YXIgc2luID0gTWF0aC5zaW4ocFsxXSAqIE1hdGguUEkgLyAxODApLFxuICAgICAgICB4ID0gKHBbMF0gLyAzNjAgKyAwLjUpLFxuICAgICAgICB5ID0gKDAuNSAtIDAuMjUgKiBNYXRoLmxvZygoMSArIHNpbikgLyAoMSAtIHNpbikpIC8gTWF0aC5QSSk7XG5cbiAgICB5ID0geSA8IC0xID8gLTEgOlxuICAgICAgICB5ID4gMSA/IDEgOiB5O1xuXG4gICAgcmV0dXJuIFt4LCB5LCAwXTtcbn1cblxuLy8gY2FsY3VsYXRlIGFyZWEgYW5kIGxlbmd0aCBvZiB0aGUgcG9seVxuZnVuY3Rpb24gY2FsY1NpemUocG9pbnRzKSB7XG4gICAgdmFyIGFyZWEgPSAwLFxuICAgICAgICBkaXN0ID0gMDtcblxuICAgIGZvciAodmFyIGkgPSAwLCBhLCBiOyBpIDwgcG9pbnRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICBhID0gYiB8fCBwb2ludHNbaV07XG4gICAgICAgIGIgPSBwb2ludHNbaSArIDFdO1xuXG4gICAgICAgIGFyZWEgKz0gYVswXSAqIGJbMV0gLSBiWzBdICogYVsxXTtcblxuICAgICAgICAvLyB1c2UgTWFuaGF0dGFuIGRpc3RhbmNlIGluc3RlYWQgb2YgRXVjbGlkaWFuIG9uZSB0byBhdm9pZCBleHBlbnNpdmUgc3F1YXJlIHJvb3QgY29tcHV0YXRpb25cbiAgICAgICAgZGlzdCArPSBNYXRoLmFicyhiWzBdIC0gYVswXSkgKyBNYXRoLmFicyhiWzFdIC0gYVsxXSk7XG4gICAgfVxuICAgIHBvaW50cy5hcmVhID0gTWF0aC5hYnMoYXJlYSAvIDIpO1xuICAgIHBvaW50cy5kaXN0ID0gZGlzdDtcbn1cblxuLy8gY2FsY3VsYXRlIHRoZSBmZWF0dXJlIGJvdW5kaW5nIGJveCBmb3IgZmFzdGVyIGNsaXBwaW5nIGxhdGVyXG5mdW5jdGlvbiBjYWxjQkJveChmZWF0dXJlKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gZmVhdHVyZS5nZW9tZXRyeSxcbiAgICAgICAgbWluID0gZmVhdHVyZS5taW4sXG4gICAgICAgIG1heCA9IGZlYXR1cmUubWF4O1xuXG4gICAgaWYgKGZlYXR1cmUudHlwZSA9PT0gMSkgY2FsY1JpbmdCQm94KG1pbiwgbWF4LCBnZW9tZXRyeSk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gMDsgaSA8IGdlb21ldHJ5Lmxlbmd0aDsgaSsrKSBjYWxjUmluZ0JCb3gobWluLCBtYXgsIGdlb21ldHJ5W2ldKTtcblxuICAgIHJldHVybiBmZWF0dXJlO1xufVxuXG5mdW5jdGlvbiBjYWxjUmluZ0JCb3gobWluLCBtYXgsIHBvaW50cykge1xuICAgIGZvciAodmFyIGkgPSAwLCBwOyBpIDwgcG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHAgPSBwb2ludHNbaV07XG4gICAgICAgIG1pblswXSA9IE1hdGgubWluKHBbMF0sIG1pblswXSk7XG4gICAgICAgIG1heFswXSA9IE1hdGgubWF4KHBbMF0sIG1heFswXSk7XG4gICAgICAgIG1pblsxXSA9IE1hdGgubWluKHBbMV0sIG1pblsxXSk7XG4gICAgICAgIG1heFsxXSA9IE1hdGgubWF4KHBbMV0sIG1heFsxXSk7XG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlb2pzb252dDtcblxudmFyIGNvbnZlcnQgPSByZXF1aXJlKCcuL2NvbnZlcnQnKSwgICAgIC8vIEdlb0pTT04gY29udmVyc2lvbiBhbmQgcHJlcHJvY2Vzc2luZ1xuICAgIHRyYW5zZm9ybSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtJyksIC8vIGNvb3JkaW5hdGUgdHJhbnNmb3JtYXRpb25cbiAgICBjbGlwID0gcmVxdWlyZSgnLi9jbGlwJyksICAgICAgICAgICAvLyBzdHJpcGUgY2xpcHBpbmcgYWxnb3JpdGhtXG4gICAgd3JhcCA9IHJlcXVpcmUoJy4vd3JhcCcpLCAgICAgICAgICAgLy8gZGF0ZSBsaW5lIHByb2Nlc3NpbmdcbiAgICBjcmVhdGVUaWxlID0gcmVxdWlyZSgnLi90aWxlJyk7ICAgICAvLyBmaW5hbCBzaW1wbGlmaWVkIHRpbGUgZ2VuZXJhdGlvblxuXG5cbmZ1bmN0aW9uIGdlb2pzb252dChkYXRhLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBHZW9KU09OVlQoZGF0YSwgb3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIEdlb0pTT05WVChkYXRhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyA9IGV4dGVuZChPYmplY3QuY3JlYXRlKHRoaXMub3B0aW9ucyksIG9wdGlvbnMpO1xuXG4gICAgdmFyIGRlYnVnID0gb3B0aW9ucy5kZWJ1ZztcblxuICAgIGlmIChkZWJ1ZykgY29uc29sZS50aW1lKCdwcmVwcm9jZXNzIGRhdGEnKTtcblxuICAgIHZhciB6MiA9IDEgPDwgb3B0aW9ucy5tYXhab29tLCAvLyAyXnpcbiAgICAgICAgZmVhdHVyZXMgPSBjb252ZXJ0KGRhdGEsIG9wdGlvbnMudG9sZXJhbmNlIC8gKHoyICogb3B0aW9ucy5leHRlbnQpKTtcblxuICAgIHRoaXMudGlsZXMgPSB7fTtcbiAgICB0aGlzLnRpbGVDb29yZHMgPSBbXTtcblxuICAgIGlmIChkZWJ1Zykge1xuICAgICAgICBjb25zb2xlLnRpbWVFbmQoJ3ByZXByb2Nlc3MgZGF0YScpO1xuICAgICAgICBjb25zb2xlLmxvZygnaW5kZXg6IG1heFpvb206ICVkLCBtYXhQb2ludHM6ICVkJywgb3B0aW9ucy5pbmRleE1heFpvb20sIG9wdGlvbnMuaW5kZXhNYXhQb2ludHMpO1xuICAgICAgICBjb25zb2xlLnRpbWUoJ2dlbmVyYXRlIHRpbGVzJyk7XG4gICAgICAgIHRoaXMuc3RhdHMgPSB7fTtcbiAgICAgICAgdGhpcy50b3RhbCA9IDA7XG4gICAgfVxuXG4gICAgZmVhdHVyZXMgPSB3cmFwKGZlYXR1cmVzLCBvcHRpb25zLmJ1ZmZlciAvIG9wdGlvbnMuZXh0ZW50LCBpbnRlcnNlY3RYKTtcblxuICAgIC8vIHN0YXJ0IHNsaWNpbmcgZnJvbSB0aGUgdG9wIHRpbGUgZG93blxuICAgIGlmIChmZWF0dXJlcy5sZW5ndGgpIHRoaXMuc3BsaXRUaWxlKGZlYXR1cmVzLCAwLCAwLCAwKTtcblxuICAgIGlmIChkZWJ1Zykge1xuICAgICAgICBpZiAoZmVhdHVyZXMubGVuZ3RoKSBjb25zb2xlLmxvZygnZmVhdHVyZXM6ICVkLCBwb2ludHM6ICVkJywgdGhpcy50aWxlc1swXS5udW1GZWF0dXJlcywgdGhpcy50aWxlc1swXS5udW1Qb2ludHMpO1xuICAgICAgICBjb25zb2xlLnRpbWVFbmQoJ2dlbmVyYXRlIHRpbGVzJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCd0aWxlcyBnZW5lcmF0ZWQ6JywgdGhpcy50b3RhbCwgSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0cykpO1xuICAgIH1cbn1cblxuR2VvSlNPTlZULnByb3RvdHlwZS5vcHRpb25zID0ge1xuICAgIG1heFpvb206IDE0LCAgICAgICAgICAgIC8vIG1heCB6b29tIHRvIHByZXNlcnZlIGRldGFpbCBvblxuICAgIGluZGV4TWF4Wm9vbTogNSwgICAgICAgIC8vIG1heCB6b29tIGluIHRoZSB0aWxlIGluZGV4XG4gICAgaW5kZXhNYXhQb2ludHM6IDEwMDAwMCwgLy8gbWF4IG51bWJlciBvZiBwb2ludHMgcGVyIHRpbGUgaW4gdGhlIHRpbGUgaW5kZXhcbiAgICBzb2xpZENoaWxkcmVuOiBmYWxzZSwgICAvLyB3aGV0aGVyIHRvIHRpbGUgc29saWQgc3F1YXJlIHRpbGVzIGZ1cnRoZXJcbiAgICB0b2xlcmFuY2U6IDMsICAgICAgICAgICAvLyBzaW1wbGlmaWNhdGlvbiB0b2xlcmFuY2UgKGhpZ2hlciBtZWFucyBzaW1wbGVyKVxuICAgIGV4dGVudDogNDA5NiwgICAgICAgICAgIC8vIHRpbGUgZXh0ZW50XG4gICAgYnVmZmVyOiA2NCwgICAgICAgICAgICAgLy8gdGlsZSBidWZmZXIgb24gZWFjaCBzaWRlXG4gICAgZGVidWc6IDAgICAgICAgICAgICAgICAgLy8gbG9nZ2luZyBsZXZlbCAoMCwgMSBvciAyKVxufTtcblxuR2VvSlNPTlZULnByb3RvdHlwZS5zcGxpdFRpbGUgPSBmdW5jdGlvbiAoZmVhdHVyZXMsIHosIHgsIHksIGN6LCBjeCwgY3kpIHtcblxuICAgIHZhciBzdGFjayA9IFtmZWF0dXJlcywgeiwgeCwgeV0sXG4gICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICAgIGRlYnVnID0gb3B0aW9ucy5kZWJ1ZyxcbiAgICAgICAgc29saWQgPSBudWxsO1xuXG4gICAgLy8gYXZvaWQgcmVjdXJzaW9uIGJ5IHVzaW5nIGEgcHJvY2Vzc2luZyBxdWV1ZVxuICAgIHdoaWxlIChzdGFjay5sZW5ndGgpIHtcbiAgICAgICAgeSA9IHN0YWNrLnBvcCgpO1xuICAgICAgICB4ID0gc3RhY2sucG9wKCk7XG4gICAgICAgIHogPSBzdGFjay5wb3AoKTtcbiAgICAgICAgZmVhdHVyZXMgPSBzdGFjay5wb3AoKTtcblxuICAgICAgICB2YXIgejIgPSAxIDw8IHosXG4gICAgICAgICAgICBpZCA9IHRvSUQoeiwgeCwgeSksXG4gICAgICAgICAgICB0aWxlID0gdGhpcy50aWxlc1tpZF0sXG4gICAgICAgICAgICB0aWxlVG9sZXJhbmNlID0geiA9PT0gb3B0aW9ucy5tYXhab29tID8gMCA6IG9wdGlvbnMudG9sZXJhbmNlIC8gKHoyICogb3B0aW9ucy5leHRlbnQpO1xuXG4gICAgICAgIGlmICghdGlsZSkge1xuICAgICAgICAgICAgaWYgKGRlYnVnID4gMSkgY29uc29sZS50aW1lKCdjcmVhdGlvbicpO1xuXG4gICAgICAgICAgICB0aWxlID0gdGhpcy50aWxlc1tpZF0gPSBjcmVhdGVUaWxlKGZlYXR1cmVzLCB6MiwgeCwgeSwgdGlsZVRvbGVyYW5jZSwgeiA9PT0gb3B0aW9ucy5tYXhab29tKTtcbiAgICAgICAgICAgIHRoaXMudGlsZUNvb3Jkcy5wdXNoKHt6OiB6LCB4OiB4LCB5OiB5fSk7XG5cbiAgICAgICAgICAgIGlmIChkZWJ1Zykge1xuICAgICAgICAgICAgICAgIGlmIChkZWJ1ZyA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3RpbGUgeiVkLSVkLSVkIChmZWF0dXJlczogJWQsIHBvaW50czogJWQsIHNpbXBsaWZpZWQ6ICVkKScsXG4gICAgICAgICAgICAgICAgICAgICAgICB6LCB4LCB5LCB0aWxlLm51bUZlYXR1cmVzLCB0aWxlLm51bVBvaW50cywgdGlsZS5udW1TaW1wbGlmaWVkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS50aW1lRW5kKCdjcmVhdGlvbicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gJ3onICsgejtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRzW2tleV0gPSAodGhpcy5zdGF0c1trZXldIHx8IDApICsgMTtcbiAgICAgICAgICAgICAgICB0aGlzLnRvdGFsKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBnZW9tZXRyeSBpbiB0aWxlIHNvIHRoYXQgd2UgY2FuIGRyaWxsIGRvd24gbGF0ZXIgaWYgd2Ugc3RvcCBub3dcbiAgICAgICAgdGlsZS5zb3VyY2UgPSBmZWF0dXJlcztcblxuICAgICAgICAvLyBpZiBpdCdzIHRoZSBmaXJzdC1wYXNzIHRpbGluZ1xuICAgICAgICBpZiAoIWN6KSB7XG4gICAgICAgICAgICAvLyBzdG9wIHRpbGluZyBpZiB3ZSByZWFjaGVkIG1heCB6b29tLCBvciBpZiB0aGUgdGlsZSBpcyB0b28gc2ltcGxlXG4gICAgICAgICAgICBpZiAoeiA9PT0gb3B0aW9ucy5pbmRleE1heFpvb20gfHwgdGlsZS5udW1Qb2ludHMgPD0gb3B0aW9ucy5pbmRleE1heFBvaW50cykgY29udGludWU7XG5cbiAgICAgICAgLy8gaWYgYSBkcmlsbGRvd24gdG8gYSBzcGVjaWZpYyB0aWxlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzdG9wIHRpbGluZyBpZiB3ZSByZWFjaGVkIGJhc2Ugem9vbSBvciBvdXIgdGFyZ2V0IHRpbGUgem9vbVxuICAgICAgICAgICAgaWYgKHogPT09IG9wdGlvbnMubWF4Wm9vbSB8fCB6ID09PSBjeikgY29udGludWU7XG5cbiAgICAgICAgICAgIC8vIHN0b3AgdGlsaW5nIGlmIGl0J3Mgbm90IGFuIGFuY2VzdG9yIG9mIHRoZSB0YXJnZXQgdGlsZVxuICAgICAgICAgICAgdmFyIG0gPSAxIDw8IChjeiAtIHopO1xuICAgICAgICAgICAgaWYgKHggIT09IE1hdGguZmxvb3IoY3ggLyBtKSB8fCB5ICE9PSBNYXRoLmZsb29yKGN5IC8gbSkpIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RvcCB0aWxpbmcgaWYgdGhlIHRpbGUgaXMgc29saWQgY2xpcHBlZCBzcXVhcmVcbiAgICAgICAgaWYgKCFvcHRpb25zLnNvbGlkQ2hpbGRyZW4gJiYgaXNDbGlwcGVkU3F1YXJlKHRpbGUsIG9wdGlvbnMuZXh0ZW50LCBvcHRpb25zLmJ1ZmZlcikpIHtcbiAgICAgICAgICAgIGlmIChjeikgc29saWQgPSB6OyAvLyBhbmQgcmVtZW1iZXIgdGhlIHpvb20gaWYgd2UncmUgZHJpbGxpbmcgZG93blxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB3ZSBzbGljZSBmdXJ0aGVyIGRvd24sIG5vIG5lZWQgdG8ga2VlcCBzb3VyY2UgZ2VvbWV0cnlcbiAgICAgICAgdGlsZS5zb3VyY2UgPSBudWxsO1xuXG4gICAgICAgIGlmIChkZWJ1ZyA+IDEpIGNvbnNvbGUudGltZSgnY2xpcHBpbmcnKTtcblxuICAgICAgICAvLyB2YWx1ZXMgd2UnbGwgdXNlIGZvciBjbGlwcGluZ1xuICAgICAgICB2YXIgazEgPSAwLjUgKiBvcHRpb25zLmJ1ZmZlciAvIG9wdGlvbnMuZXh0ZW50LFxuICAgICAgICAgICAgazIgPSAwLjUgLSBrMSxcbiAgICAgICAgICAgIGszID0gMC41ICsgazEsXG4gICAgICAgICAgICBrNCA9IDEgKyBrMSxcbiAgICAgICAgICAgIHRsLCBibCwgdHIsIGJyLCBsZWZ0LCByaWdodDtcblxuICAgICAgICB0bCA9IGJsID0gdHIgPSBiciA9IG51bGw7XG5cbiAgICAgICAgbGVmdCAgPSBjbGlwKGZlYXR1cmVzLCB6MiwgeCAtIGsxLCB4ICsgazMsIDAsIGludGVyc2VjdFgsIHRpbGUubWluWzBdLCB0aWxlLm1heFswXSk7XG4gICAgICAgIHJpZ2h0ID0gY2xpcChmZWF0dXJlcywgejIsIHggKyBrMiwgeCArIGs0LCAwLCBpbnRlcnNlY3RYLCB0aWxlLm1pblswXSwgdGlsZS5tYXhbMF0pO1xuXG4gICAgICAgIGlmIChsZWZ0KSB7XG4gICAgICAgICAgICB0bCA9IGNsaXAobGVmdCwgejIsIHkgLSBrMSwgeSArIGszLCAxLCBpbnRlcnNlY3RZLCB0aWxlLm1pblsxXSwgdGlsZS5tYXhbMV0pO1xuICAgICAgICAgICAgYmwgPSBjbGlwKGxlZnQsIHoyLCB5ICsgazIsIHkgKyBrNCwgMSwgaW50ZXJzZWN0WSwgdGlsZS5taW5bMV0sIHRpbGUubWF4WzFdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyaWdodCkge1xuICAgICAgICAgICAgdHIgPSBjbGlwKHJpZ2h0LCB6MiwgeSAtIGsxLCB5ICsgazMsIDEsIGludGVyc2VjdFksIHRpbGUubWluWzFdLCB0aWxlLm1heFsxXSk7XG4gICAgICAgICAgICBiciA9IGNsaXAocmlnaHQsIHoyLCB5ICsgazIsIHkgKyBrNCwgMSwgaW50ZXJzZWN0WSwgdGlsZS5taW5bMV0sIHRpbGUubWF4WzFdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZWJ1ZyA+IDEpIGNvbnNvbGUudGltZUVuZCgnY2xpcHBpbmcnKTtcblxuICAgICAgICBpZiAodGwpIHN0YWNrLnB1c2godGwsIHogKyAxLCB4ICogMiwgICAgIHkgKiAyKTtcbiAgICAgICAgaWYgKGJsKSBzdGFjay5wdXNoKGJsLCB6ICsgMSwgeCAqIDIsICAgICB5ICogMiArIDEpO1xuICAgICAgICBpZiAodHIpIHN0YWNrLnB1c2godHIsIHogKyAxLCB4ICogMiArIDEsIHkgKiAyKTtcbiAgICAgICAgaWYgKGJyKSBzdGFjay5wdXNoKGJyLCB6ICsgMSwgeCAqIDIgKyAxLCB5ICogMiArIDEpO1xuICAgIH1cblxuICAgIHJldHVybiBzb2xpZDtcbn07XG5cbkdlb0pTT05WVC5wcm90b3R5cGUuZ2V0VGlsZSA9IGZ1bmN0aW9uICh6LCB4LCB5KSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICAgIGV4dGVudCA9IG9wdGlvbnMuZXh0ZW50LFxuICAgICAgICBkZWJ1ZyA9IG9wdGlvbnMuZGVidWc7XG5cbiAgICB2YXIgejIgPSAxIDw8IHo7XG4gICAgeCA9ICgoeCAlIHoyKSArIHoyKSAlIHoyOyAvLyB3cmFwIHRpbGUgeCBjb29yZGluYXRlXG5cbiAgICB2YXIgaWQgPSB0b0lEKHosIHgsIHkpO1xuICAgIGlmICh0aGlzLnRpbGVzW2lkXSkgcmV0dXJuIHRyYW5zZm9ybS50aWxlKHRoaXMudGlsZXNbaWRdLCBleHRlbnQpO1xuXG4gICAgaWYgKGRlYnVnID4gMSkgY29uc29sZS5sb2coJ2RyaWxsaW5nIGRvd24gdG8geiVkLSVkLSVkJywgeiwgeCwgeSk7XG5cbiAgICB2YXIgejAgPSB6LFxuICAgICAgICB4MCA9IHgsXG4gICAgICAgIHkwID0geSxcbiAgICAgICAgcGFyZW50O1xuXG4gICAgd2hpbGUgKCFwYXJlbnQgJiYgejAgPiAwKSB7XG4gICAgICAgIHowLS07XG4gICAgICAgIHgwID0gTWF0aC5mbG9vcih4MCAvIDIpO1xuICAgICAgICB5MCA9IE1hdGguZmxvb3IoeTAgLyAyKTtcbiAgICAgICAgcGFyZW50ID0gdGhpcy50aWxlc1t0b0lEKHowLCB4MCwgeTApXTtcbiAgICB9XG5cbiAgICBpZiAoIXBhcmVudCB8fCAhcGFyZW50LnNvdXJjZSkgcmV0dXJuIG51bGw7XG5cbiAgICAvLyBpZiB3ZSBmb3VuZCBhIHBhcmVudCB0aWxlIGNvbnRhaW5pbmcgdGhlIG9yaWdpbmFsIGdlb21ldHJ5LCB3ZSBjYW4gZHJpbGwgZG93biBmcm9tIGl0XG4gICAgaWYgKGRlYnVnID4gMSkgY29uc29sZS5sb2coJ2ZvdW5kIHBhcmVudCB0aWxlIHolZC0lZC0lZCcsIHowLCB4MCwgeTApO1xuXG4gICAgLy8gaXQgcGFyZW50IHRpbGUgaXMgYSBzb2xpZCBjbGlwcGVkIHNxdWFyZSwgcmV0dXJuIGl0IGluc3RlYWQgc2luY2UgaXQncyBpZGVudGljYWxcbiAgICBpZiAoaXNDbGlwcGVkU3F1YXJlKHBhcmVudCwgZXh0ZW50LCBvcHRpb25zLmJ1ZmZlcikpIHJldHVybiB0cmFuc2Zvcm0udGlsZShwYXJlbnQsIGV4dGVudCk7XG5cbiAgICBpZiAoZGVidWcgPiAxKSBjb25zb2xlLnRpbWUoJ2RyaWxsaW5nIGRvd24nKTtcbiAgICB2YXIgc29saWQgPSB0aGlzLnNwbGl0VGlsZShwYXJlbnQuc291cmNlLCB6MCwgeDAsIHkwLCB6LCB4LCB5KTtcbiAgICBpZiAoZGVidWcgPiAxKSBjb25zb2xlLnRpbWVFbmQoJ2RyaWxsaW5nIGRvd24nKTtcblxuICAgIC8vIG9uZSBvZiB0aGUgcGFyZW50IHRpbGVzIHdhcyBhIHNvbGlkIGNsaXBwZWQgc3F1YXJlXG4gICAgaWYgKHNvbGlkICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBtID0gMSA8PCAoeiAtIHNvbGlkKTtcbiAgICAgICAgaWQgPSB0b0lEKHNvbGlkLCBNYXRoLmZsb29yKHggLyBtKSwgTWF0aC5mbG9vcih5IC8gbSkpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRpbGVzW2lkXSA/IHRyYW5zZm9ybS50aWxlKHRoaXMudGlsZXNbaWRdLCBleHRlbnQpIDogbnVsbDtcbn07XG5cbmZ1bmN0aW9uIHRvSUQoeiwgeCwgeSkge1xuICAgIHJldHVybiAoKCgxIDw8IHopICogeSArIHgpICogMzIpICsgejtcbn1cblxuZnVuY3Rpb24gaW50ZXJzZWN0WChhLCBiLCB4KSB7XG4gICAgcmV0dXJuIFt4LCAoeCAtIGFbMF0pICogKGJbMV0gLSBhWzFdKSAvIChiWzBdIC0gYVswXSkgKyBhWzFdLCAxXTtcbn1cbmZ1bmN0aW9uIGludGVyc2VjdFkoYSwgYiwgeSkge1xuICAgIHJldHVybiBbKHkgLSBhWzFdKSAqIChiWzBdIC0gYVswXSkgLyAoYlsxXSAtIGFbMV0pICsgYVswXSwgeSwgMV07XG59XG5cbmZ1bmN0aW9uIGV4dGVuZChkZXN0LCBzcmMpIHtcbiAgICBmb3IgKHZhciBpIGluIHNyYykgZGVzdFtpXSA9IHNyY1tpXTtcbiAgICByZXR1cm4gZGVzdDtcbn1cblxuLy8gY2hlY2tzIHdoZXRoZXIgYSB0aWxlIGlzIGEgd2hvbGUtYXJlYSBmaWxsIGFmdGVyIGNsaXBwaW5nOyBpZiBpdCBpcywgdGhlcmUncyBubyBzZW5zZSBzbGljaW5nIGl0IGZ1cnRoZXJcbmZ1bmN0aW9uIGlzQ2xpcHBlZFNxdWFyZSh0aWxlLCBleHRlbnQsIGJ1ZmZlcikge1xuXG4gICAgdmFyIGZlYXR1cmVzID0gdGlsZS5zb3VyY2U7XG4gICAgaWYgKGZlYXR1cmVzLmxlbmd0aCAhPT0gMSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgdmFyIGZlYXR1cmUgPSBmZWF0dXJlc1swXTtcbiAgICBpZiAoZmVhdHVyZS50eXBlICE9PSAzIHx8IGZlYXR1cmUuZ2VvbWV0cnkubGVuZ3RoID4gMSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgdmFyIGxlbiA9IGZlYXR1cmUuZ2VvbWV0cnlbMF0ubGVuZ3RoO1xuICAgIGlmIChsZW4gIT09IDUpIHJldHVybiBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgdmFyIHAgPSB0cmFuc2Zvcm0ucG9pbnQoZmVhdHVyZS5nZW9tZXRyeVswXVtpXSwgZXh0ZW50LCB0aWxlLnoyLCB0aWxlLngsIHRpbGUueSk7XG4gICAgICAgIGlmICgocFswXSAhPT0gLWJ1ZmZlciAmJiBwWzBdICE9PSBleHRlbnQgKyBidWZmZXIpIHx8XG4gICAgICAgICAgICAocFsxXSAhPT0gLWJ1ZmZlciAmJiBwWzFdICE9PSBleHRlbnQgKyBidWZmZXIpKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gc2ltcGxpZnk7XG5cbi8vIGNhbGN1bGF0ZSBzaW1wbGlmaWNhdGlvbiBkYXRhIHVzaW5nIG9wdGltaXplZCBEb3VnbGFzLVBldWNrZXIgYWxnb3JpdGhtXG5cbmZ1bmN0aW9uIHNpbXBsaWZ5KHBvaW50cywgdG9sZXJhbmNlKSB7XG5cbiAgICB2YXIgc3FUb2xlcmFuY2UgPSB0b2xlcmFuY2UgKiB0b2xlcmFuY2UsXG4gICAgICAgIGxlbiA9IHBvaW50cy5sZW5ndGgsXG4gICAgICAgIGZpcnN0ID0gMCxcbiAgICAgICAgbGFzdCA9IGxlbiAtIDEsXG4gICAgICAgIHN0YWNrID0gW10sXG4gICAgICAgIGksIG1heFNxRGlzdCwgc3FEaXN0LCBpbmRleDtcblxuICAgIC8vIGFsd2F5cyByZXRhaW4gdGhlIGVuZHBvaW50cyAoMSBpcyB0aGUgbWF4IHZhbHVlKVxuICAgIHBvaW50c1tmaXJzdF1bMl0gPSAxO1xuICAgIHBvaW50c1tsYXN0XVsyXSA9IDE7XG5cbiAgICAvLyBhdm9pZCByZWN1cnNpb24gYnkgdXNpbmcgYSBzdGFja1xuICAgIHdoaWxlIChsYXN0KSB7XG5cbiAgICAgICAgbWF4U3FEaXN0ID0gMDtcblxuICAgICAgICBmb3IgKGkgPSBmaXJzdCArIDE7IGkgPCBsYXN0OyBpKyspIHtcbiAgICAgICAgICAgIHNxRGlzdCA9IGdldFNxU2VnRGlzdChwb2ludHNbaV0sIHBvaW50c1tmaXJzdF0sIHBvaW50c1tsYXN0XSk7XG5cbiAgICAgICAgICAgIGlmIChzcURpc3QgPiBtYXhTcURpc3QpIHtcbiAgICAgICAgICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgbWF4U3FEaXN0ID0gc3FEaXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1heFNxRGlzdCA+IHNxVG9sZXJhbmNlKSB7XG4gICAgICAgICAgICBwb2ludHNbaW5kZXhdWzJdID0gbWF4U3FEaXN0OyAvLyBzYXZlIHRoZSBwb2ludCBpbXBvcnRhbmNlIGluIHNxdWFyZWQgcGl4ZWxzIGFzIGEgeiBjb29yZGluYXRlXG4gICAgICAgICAgICBzdGFjay5wdXNoKGZpcnN0KTtcbiAgICAgICAgICAgIHN0YWNrLnB1c2goaW5kZXgpO1xuICAgICAgICAgICAgZmlyc3QgPSBpbmRleDtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGFzdCA9IHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgZmlyc3QgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLy8gc3F1YXJlIGRpc3RhbmNlIGZyb20gYSBwb2ludCB0byBhIHNlZ21lbnRcbmZ1bmN0aW9uIGdldFNxU2VnRGlzdChwLCBhLCBiKSB7XG5cbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLFxuICAgICAgICBieCA9IGJbMF0sIGJ5ID0gYlsxXSxcbiAgICAgICAgcHggPSBwWzBdLCBweSA9IHBbMV0sXG4gICAgICAgIGR4ID0gYnggLSB4LFxuICAgICAgICBkeSA9IGJ5IC0geTtcblxuICAgIGlmIChkeCAhPT0gMCB8fCBkeSAhPT0gMCkge1xuXG4gICAgICAgIHZhciB0ID0gKChweCAtIHgpICogZHggKyAocHkgLSB5KSAqIGR5KSAvIChkeCAqIGR4ICsgZHkgKiBkeSk7XG5cbiAgICAgICAgaWYgKHQgPiAxKSB7XG4gICAgICAgICAgICB4ID0gYng7XG4gICAgICAgICAgICB5ID0gYnk7XG5cbiAgICAgICAgfSBlbHNlIGlmICh0ID4gMCkge1xuICAgICAgICAgICAgeCArPSBkeCAqIHQ7XG4gICAgICAgICAgICB5ICs9IGR5ICogdDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGR4ID0gcHggLSB4O1xuICAgIGR5ID0gcHkgLSB5O1xuXG4gICAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVRpbGU7XG5cbmZ1bmN0aW9uIGNyZWF0ZVRpbGUoZmVhdHVyZXMsIHoyLCB0eCwgdHksIHRvbGVyYW5jZSwgbm9TaW1wbGlmeSkge1xuICAgIHZhciB0aWxlID0ge1xuICAgICAgICBmZWF0dXJlczogW10sXG4gICAgICAgIG51bVBvaW50czogMCxcbiAgICAgICAgbnVtU2ltcGxpZmllZDogMCxcbiAgICAgICAgbnVtRmVhdHVyZXM6IDAsXG4gICAgICAgIHNvdXJjZTogbnVsbCxcbiAgICAgICAgeDogdHgsXG4gICAgICAgIHk6IHR5LFxuICAgICAgICB6MjogejIsXG4gICAgICAgIHRyYW5zZm9ybWVkOiBmYWxzZSxcbiAgICAgICAgbWluOiBbMiwgMV0sXG4gICAgICAgIG1heDogWy0xLCAwXVxuICAgIH07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aWxlLm51bUZlYXR1cmVzKys7XG4gICAgICAgIGFkZEZlYXR1cmUodGlsZSwgZmVhdHVyZXNbaV0sIHRvbGVyYW5jZSwgbm9TaW1wbGlmeSk7XG5cbiAgICAgICAgdmFyIG1pbiA9IGZlYXR1cmVzW2ldLm1pbixcbiAgICAgICAgICAgIG1heCA9IGZlYXR1cmVzW2ldLm1heDtcblxuICAgICAgICBpZiAobWluWzBdIDwgdGlsZS5taW5bMF0pIHRpbGUubWluWzBdID0gbWluWzBdO1xuICAgICAgICBpZiAobWluWzFdIDwgdGlsZS5taW5bMV0pIHRpbGUubWluWzFdID0gbWluWzFdO1xuICAgICAgICBpZiAobWF4WzBdID4gdGlsZS5tYXhbMF0pIHRpbGUubWF4WzBdID0gbWF4WzBdO1xuICAgICAgICBpZiAobWF4WzFdID4gdGlsZS5tYXhbMV0pIHRpbGUubWF4WzFdID0gbWF4WzFdO1xuICAgIH1cbiAgICByZXR1cm4gdGlsZTtcbn1cblxuZnVuY3Rpb24gYWRkRmVhdHVyZSh0aWxlLCBmZWF0dXJlLCB0b2xlcmFuY2UsIG5vU2ltcGxpZnkpIHtcblxuICAgIHZhciBnZW9tID0gZmVhdHVyZS5nZW9tZXRyeSxcbiAgICAgICAgdHlwZSA9IGZlYXR1cmUudHlwZSxcbiAgICAgICAgc2ltcGxpZmllZCA9IFtdLFxuICAgICAgICBzcVRvbGVyYW5jZSA9IHRvbGVyYW5jZSAqIHRvbGVyYW5jZSxcbiAgICAgICAgaSwgaiwgcmluZywgcDtcblxuICAgIGlmICh0eXBlID09PSAxKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBnZW9tLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzaW1wbGlmaWVkLnB1c2goZ2VvbVtpXSk7XG4gICAgICAgICAgICB0aWxlLm51bVBvaW50cysrO1xuICAgICAgICAgICAgdGlsZS5udW1TaW1wbGlmaWVkKys7XG4gICAgICAgIH1cblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gc2ltcGxpZnkgYW5kIHRyYW5zZm9ybSBwcm9qZWN0ZWQgY29vcmRpbmF0ZXMgZm9yIHRpbGUgZ2VvbWV0cnlcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGdlb20ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHJpbmcgPSBnZW9tW2ldO1xuXG4gICAgICAgICAgICAvLyBmaWx0ZXIgb3V0IHRpbnkgcG9seWxpbmVzICYgcG9seWdvbnNcbiAgICAgICAgICAgIGlmICghbm9TaW1wbGlmeSAmJiAoKHR5cGUgPT09IDIgJiYgcmluZy5kaXN0IDwgdG9sZXJhbmNlKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodHlwZSA9PT0gMyAmJiByaW5nLmFyZWEgPCBzcVRvbGVyYW5jZSkpKSB7XG4gICAgICAgICAgICAgICAgdGlsZS5udW1Qb2ludHMgKz0gcmluZy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzaW1wbGlmaWVkUmluZyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgcmluZy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIHAgPSByaW5nW2pdO1xuICAgICAgICAgICAgICAgIC8vIGtlZXAgcG9pbnRzIHdpdGggaW1wb3J0YW5jZSA+IHRvbGVyYW5jZVxuICAgICAgICAgICAgICAgIGlmIChub1NpbXBsaWZ5IHx8IHBbMl0gPiBzcVRvbGVyYW5jZSkge1xuICAgICAgICAgICAgICAgICAgICBzaW1wbGlmaWVkUmluZy5wdXNoKHApO1xuICAgICAgICAgICAgICAgICAgICB0aWxlLm51bVNpbXBsaWZpZWQrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGlsZS5udW1Qb2ludHMrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2ltcGxpZmllZC5wdXNoKHNpbXBsaWZpZWRSaW5nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzaW1wbGlmaWVkLmxlbmd0aCkge1xuICAgICAgICB0aWxlLmZlYXR1cmVzLnB1c2goe1xuICAgICAgICAgICAgZ2VvbWV0cnk6IHNpbXBsaWZpZWQsXG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgdGFnczogZmVhdHVyZS50YWdzIHx8IG51bGxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLnRpbGUgPSB0cmFuc2Zvcm1UaWxlO1xuZXhwb3J0cy5wb2ludCA9IHRyYW5zZm9ybVBvaW50O1xuXG4vLyBUcmFuc2Zvcm1zIHRoZSBjb29yZGluYXRlcyBvZiBlYWNoIGZlYXR1cmUgaW4gdGhlIGdpdmVuIHRpbGUgZnJvbVxuLy8gbWVyY2F0b3ItcHJvamVjdGVkIHNwYWNlIGludG8gKGV4dGVudCB4IGV4dGVudCkgdGlsZSBzcGFjZS5cbmZ1bmN0aW9uIHRyYW5zZm9ybVRpbGUodGlsZSwgZXh0ZW50KSB7XG4gICAgaWYgKHRpbGUudHJhbnNmb3JtZWQpIHJldHVybiB0aWxlO1xuXG4gICAgdmFyIHoyID0gdGlsZS56MixcbiAgICAgICAgdHggPSB0aWxlLngsXG4gICAgICAgIHR5ID0gdGlsZS55LFxuICAgICAgICBpLCBqLCBrO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHRpbGUuZmVhdHVyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGZlYXR1cmUgPSB0aWxlLmZlYXR1cmVzW2ldLFxuICAgICAgICAgICAgZ2VvbSA9IGZlYXR1cmUuZ2VvbWV0cnksXG4gICAgICAgICAgICB0eXBlID0gZmVhdHVyZS50eXBlO1xuXG4gICAgICAgIGlmICh0eXBlID09PSAxKSB7XG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgZ2VvbS5sZW5ndGg7IGorKykgZ2VvbVtqXSA9IHRyYW5zZm9ybVBvaW50KGdlb21bal0sIGV4dGVudCwgejIsIHR4LCB0eSk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBnZW9tLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJpbmcgPSBnZW9tW2pdO1xuICAgICAgICAgICAgICAgIGZvciAoayA9IDA7IGsgPCByaW5nLmxlbmd0aDsgaysrKSByaW5nW2tdID0gdHJhbnNmb3JtUG9pbnQocmluZ1trXSwgZXh0ZW50LCB6MiwgdHgsIHR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRpbGUudHJhbnNmb3JtZWQgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHRpbGU7XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVBvaW50KHAsIGV4dGVudCwgejIsIHR4LCB0eSkge1xuICAgIHZhciB4ID0gTWF0aC5yb3VuZChleHRlbnQgKiAocFswXSAqIHoyIC0gdHgpKSxcbiAgICAgICAgeSA9IE1hdGgucm91bmQoZXh0ZW50ICogKHBbMV0gKiB6MiAtIHR5KSk7XG4gICAgcmV0dXJuIFt4LCB5XTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNsaXAgPSByZXF1aXJlKCcuL2NsaXAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB3cmFwO1xuXG5mdW5jdGlvbiB3cmFwKGZlYXR1cmVzLCBidWZmZXIsIGludGVyc2VjdFgpIHtcbiAgICB2YXIgbWVyZ2VkID0gZmVhdHVyZXMsXG4gICAgICAgIGxlZnQgID0gY2xpcChmZWF0dXJlcywgMSwgLTEgLSBidWZmZXIsIGJ1ZmZlciwgICAgIDAsIGludGVyc2VjdFgsIC0xLCAyKSwgLy8gbGVmdCB3b3JsZCBjb3B5XG4gICAgICAgIHJpZ2h0ID0gY2xpcChmZWF0dXJlcywgMSwgIDEgLSBidWZmZXIsIDIgKyBidWZmZXIsIDAsIGludGVyc2VjdFgsIC0xLCAyKTsgLy8gcmlnaHQgd29ybGQgY29weVxuXG4gICAgaWYgKGxlZnQgfHwgcmlnaHQpIHtcbiAgICAgICAgbWVyZ2VkID0gY2xpcChmZWF0dXJlcywgMSwgLWJ1ZmZlciwgMSArIGJ1ZmZlciwgMCwgaW50ZXJzZWN0WCwgLTEsIDIpOyAvLyBjZW50ZXIgd29ybGQgY29weVxuXG4gICAgICAgIGlmIChsZWZ0KSBtZXJnZWQgPSBzaGlmdEZlYXR1cmVDb29yZHMobGVmdCwgMSkuY29uY2F0KG1lcmdlZCk7IC8vIG1lcmdlIGxlZnQgaW50byBjZW50ZXJcbiAgICAgICAgaWYgKHJpZ2h0KSBtZXJnZWQgPSBtZXJnZWQuY29uY2F0KHNoaWZ0RmVhdHVyZUNvb3JkcyhyaWdodCwgLTEpKTsgLy8gbWVyZ2UgcmlnaHQgaW50byBjZW50ZXJcbiAgICB9XG5cbiAgICByZXR1cm4gbWVyZ2VkO1xufVxuXG5mdW5jdGlvbiBzaGlmdEZlYXR1cmVDb29yZHMoZmVhdHVyZXMsIG9mZnNldCkge1xuICAgIHZhciBuZXdGZWF0dXJlcyA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZmVhdHVyZSA9IGZlYXR1cmVzW2ldLFxuICAgICAgICAgICAgdHlwZSA9IGZlYXR1cmUudHlwZTtcblxuICAgICAgICB2YXIgbmV3R2VvbWV0cnk7XG5cbiAgICAgICAgaWYgKHR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgIG5ld0dlb21ldHJ5ID0gc2hpZnRDb29yZHMoZmVhdHVyZS5nZW9tZXRyeSwgb2Zmc2V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld0dlb21ldHJ5ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGZlYXR1cmUuZ2VvbWV0cnkubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBuZXdHZW9tZXRyeS5wdXNoKHNoaWZ0Q29vcmRzKGZlYXR1cmUuZ2VvbWV0cnlbal0sIG9mZnNldCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbmV3RmVhdHVyZXMucHVzaCh7XG4gICAgICAgICAgICBnZW9tZXRyeTogbmV3R2VvbWV0cnksXG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgdGFnczogZmVhdHVyZS50YWdzLFxuICAgICAgICAgICAgbWluOiBbZmVhdHVyZS5taW5bMF0gKyBvZmZzZXQsIGZlYXR1cmUubWluWzFdXSxcbiAgICAgICAgICAgIG1heDogW2ZlYXR1cmUubWF4WzBdICsgb2Zmc2V0LCBmZWF0dXJlLm1heFsxXV1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld0ZlYXR1cmVzO1xufVxuXG5mdW5jdGlvbiBzaGlmdENvb3Jkcyhwb2ludHMsIG9mZnNldCkge1xuICAgIHZhciBuZXdQb2ludHMgPSBbXTtcbiAgICBuZXdQb2ludHMuYXJlYSA9IHBvaW50cy5hcmVhO1xuICAgIG5ld1BvaW50cy5kaXN0ID0gcG9pbnRzLmRpc3Q7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBuZXdQb2ludHMucHVzaChbcG9pbnRzW2ldWzBdICsgb2Zmc2V0LCBwb2ludHNbaV1bMV0sIHBvaW50c1tpXVsyXV0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3UG9pbnRzO1xufVxuIl19
