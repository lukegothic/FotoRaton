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
    var createLine = function (x1, y1, x2, y2, width, color) {
        var length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        var transform = 'rotate(' + angle + 'deg)';
        var line = document.createElement("div");
        line.style.transformOrigin = "0 100%";
        line.style.position = "absolute";
        line.style.transform = transform;
        line.style.width = length + "px";
        line.style.top = y1 + "px";
        line.style.left = x1 + "px";
        line.style.height = (width ? width : "2") + "px";
        line.style.backgroundColor = color ? color : "#000";
        document.body.appendChild(line);
        return line;
    };
    var createLineBetweenElements = function (elem1, elem2, width, color) {
        // TODO: LOGICA QUE DETERMINA DE DONDE PARTE LA LINEA
        var eRect1 = elem1.getBoundingClientRect();
        var eRect2 = elem2.getBoundingClientRect();
        return createLine(eRect1.left, eRect1.top, eRect2.left, eRect2.top, width, color);
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
    var isInsidePolygon = function (point, polygon) {
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
    var isInsideFeatures = function (point, features) {
        var result = false;
        for (var f = 0; f < features.length; f++) {
            result = Utils.isInsidePolygon(point, features[f].geometry.coordinates);
            if (result) {
                break;
            }
        }
        return result;
    };
    var postJSON = function (url, data, callback) {
        var request = new XMLHttpRequest();
        request.open('POST', url, true);
        //request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                console.log(this.response);
            } else {
                // We reached our target server, but it returned an error
            }
        };
        request.send(data);
    };
	var getJSON = function(url, callback) {
		// GETJSON
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.onload = function() {
		  if (this.status >= 200 && this.status < 400) {
			// Success!
			var data = JSON.parse(this.response);
			callback(data);
		  } else {
			// We reached our target server, but it returned an error
		  }
		};
		request.onerror = function() {
		  // There was a connection error of some sort
		};
		request.send();
	};
	var getJSONP = function (url, callback) {
	    url += "&callback={0}&_={1}".format(callback, +(new Date()));
	    var script = document.createElement('script');
	    script.src = url;
	    document.head.appendChild(script);
	};
	var createCustomEvent = function (name, data) {
	    if (window.CustomEvent) {
	        var event = new CustomEvent(name, { detail: data });
	    } else {
	        var event = document.createEvent('CustomEvent');
	        event.initCustomEvent(name, true, true, data);
	    }
	    return event;
	};
	var stopPropagation = function (e) {
	    e.stopPropagation();
	};
    return {
        getRandomRange: getRandomRange
        , isInsideRing: isInsideRing
		, isInsidePolygon: isInsidePolygon
        , isInsideFeatures: isInsideFeatures
		, queryString: queryString
		, getJSON: getJSON
        , postJSON: postJSON
		, getJSONP: getJSONP
		, createCustomEvent: createCustomEvent
        , stopPropagation: stopPropagation
        , createLineBetweenElements: createLineBetweenElements
    }
})();