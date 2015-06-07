var Utils = (function () {
	var queryString = function(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	};
    var getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    var getRandomRange = function (min, max, size) {
        var start = getRandomInt(min, max - size + 1);
        return {
            start: start
            , end: start + size - 1
        }
    };
    // Funcion que calcula si un punto esta dentro de un poligono
    var isInsideRing = function (point, ring) {
        var result = false;
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            var xi = ring[i][0], yi = ring[i][1];
            var xj = ring[j][0], yj = ring[j][1];
            var intersect = ((yi > point[1]) != (yj > point[1])) &&
                (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
            if (intersect) result = !result;
        }
        return result;
    };
	var isInsidePolygon = function(point, polygon) {
		var result = false;
		var rings;
		for (var p = 0; p < polygon.length; p++) {
			rings = polygon[p];
			for (var r = 0; r < rings.length; r++) {
				result = Utils.isInsideRing(point, rings[r]);
				if (result) {
					break;
				}
			}
			if (result) {
				break;
			}
		}
		return result;
	};
	var geometryToSimpleCoords = function (geometry) {
		var coords = [];
		if (geometry instanceof OpenLayers.Geometry.MultiPolygon) {
			for (var i = 0; i < geometry.components.length; i++) {
				coords.push(geometryToSimpleCoords(geometry.components[i]));
			}
		}
		if (geometry instanceof OpenLayers.Geometry.Polygon) {
			for (var i = 0; i < geometry.components.length; i++) {
				coords.push(geometryToSimpleCoords(geometry.components[i]))
			}
		}
		if (geometry instanceof OpenLayers.Geometry.LinearRing) {
			for (var i = 0; i < geometry.components.length; i++) {
				coords.push(geometryToSimpleCoords(geometry.components[i]))
			}
		}
		if (geometry instanceof OpenLayers.Geometry.Point) {
			coords = [geometry.x, geometry.y];
		}
		return coords;
	};
    return {
        getRandomRange: getRandomRange
        , isInsideRing: isInsideRing
		, isInsidePolygon: isInsidePolygon
		, geometryToSimpleCoords: geometryToSimpleCoords
		, queryString: queryString
    }
})();