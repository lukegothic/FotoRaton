FR = window.FR || {};
FR.Map = (function () {
	var map;
	var marker = null;
	var ready = false;
	var locationLimitsLayer;
	var setup = function (sectionData) {
	    if (!ready) init();
	    addGameLayers(sectionData);
	};
	var init = function() {
		// MAP
		map = L.map('map');
		// BASELAYER MAPBOX: mapbox.streets mapbox.streets-satellite mapbox.light
		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
			//attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery \u00A9 <a href="http://mapbox.com">Mapbox</a>',
			maxZoom: 19,
			minZoom: 12,
			id: 'mapbox.streets-satellite',
			accessToken: 'pk.eyJ1IjoibHVrZWdvdGhpYyIsImEiOiIxZThlZDdmOTNjOTQwYTI3ODM3NzBlZWZkZmZlNDM4OSJ9.gkhfsHPAN0Nnmcd7vqDWmQ'
		}).addTo(map);
		ready = true;
	};
	//var onMapClick = function (e) {
	//    //FR.Game.setState(FR.Game.STATES.GUESSINMAP);
	//    if (!marker) {
	//	    marker = L.marker(e.latlng, {
	//	        clickable: true
	//			, draggable: true
	//			, keyboard: false
	//	    }).addTo(map);
	//	} else {
	//		marker.setLatLng(e.latlng);
	//    }
	//    FR.Game.guess();
	//};
	var progressLayer;
	var getProgressLayer = function () {
	    return progressLayer;
	};
	var addPOIThumbnail = function (lat, lng, url) {
        L.marker(L.latLng(lat, lng), {
            "riseOnHover": true,
            "icon": L.icon({
                "iconUrl": url,
                "iconAnchor": [17, 17],
                "className": "photomarker"
            })
        }).on({
            click: function () {
                //a = Utils.createLineBetweenElements(this._icon, li, 2, "#fff");
                console.log(this, "click");
            },
            mouseover: function () {
                //a = Utils.createLineBetweenElements(this._icon, li, 2, "#fff");
                console.log(this, "over");
            },
            mouseout: function () {
                //document.body.removeChild(a);
                console.log(this, "out")
            }
        }).addTo(map);
	}
	var addPOIThumbnails = function (pois) {
	    for (var p = 0, poi = pois[p]; p < pois.length; poi = pois[++p]) {
	        if (pois[p].discovered) {
				FR.Map.addPOIThumbnail(poi.latitude, poi.longitude, "http://mw2.google.com/mw-panoramio/photos/mini_square/" + poi.id + ".jpg");
	        }
	    }
	};
	var addGameLayers = function (sectionData, layers) {
	    if (!layers) {
	        var locationCode = FR.Game.getPlayLocation().code;
	        if (localStorage[locationCode + "_geom"] && localStorage[locationCode + "_sections_geom"]) {
	            addGameLayers(sectionData, { limits: JSON.parse(localStorage[locationCode + "_geom"]), sections: JSON.parse(localStorage[locationCode + "_sections_geom"]) });
	        } else {
	            var url = "data/maps/" + locationCode + ".json";
	            Utils.getJSON(url, function (locationGEOJSON) {
	                localStorage[locationCode + "_geom"] = JSON.stringify(locationGEOJSON);
	                url = "data/maps/pieces/" + locationCode + ".json";
	                Utils.getJSON(url, function (sectionsGEOJSON) {
	                    localStorage[locationCode + "_sections_geom"] = JSON.stringify(sectionsGEOJSON);
	                    addGameLayers(sectionData, { limits: locationGEOJSON, sections: sectionsGEOJSON });
	                });
	            });
	        }
	    } else {
	        // Limite location
	        locationLimitsLayer = L.geoJson(layers.limits, {
	            style: function (feature) {
	                //http://leafletjs.com/reference.html#path
	                return {
	                    color: '#f00',
	                    weight: 2,
	                    opacity: 1,
	                    dashArray: '5, 5',
	                    fill: false,
	                    clickable: false,
	                };
	            }
	        }).addTo(map);
            // Labels con progreso
	        progressLayer = L.layerGroup().addTo(map);
	        // Zona de juego
	        locationSectionsLayer = L.geoJson(layers.sections, {
	            style: function (feature) {
	                //http://leafletjs.com/reference.html#path
	                var fillColor = "#000";
	                if (sectionData[feature.id].unlocked) {
	                    /* DEGRADADO F00 FF0 0F0 en fill en funcion de avance */
	                    fillColor = "#";
	                    var completePercentage = sectionData[feature.id].discovered / sectionData[feature.id].total;
	                    // ROJO
	                    if (completePercentage > 0.5) {
	                        var red = (255 - Math.round(255 * ((completePercentage * 2) - 1))).toString(16);
	                        if (red == "0") red = "00";
	                        fillColor += red;
	                    } else {
	                        fillColor += "ff";
	                    }
                        // VERDE
	                    if (completePercentage < 0.5) {
	                        var green = Math.round(255 * (completePercentage * 2)).toString(16);
	                        if (green == "0") green = "00";
	                        fillColor += green;
	                    } else {
	                        fillColor += "ff";
	                    }
	                    fillColor += "00";
	                }
	                return {
	                    color: "#fff",
	                    weight: 2,
	                    opacity: 1,
	                    fillOpacity: 0.5,
	                    fillColor: fillColor,
	                    fill: true,
	                    clickable: true
	                };
	            },
	            onEachFeature: function (feature, layer) {
	                var lockIcon = L.icon({ iconUrl: 'img/locked.png', iconAnchor: [15, 15] });
	                var icon, clickFn;
	                if (sectionData[feature.id].unlocked) {
	                    // Texto con porcentaje de avance
	                    var completePercentage = (sectionData[feature.id].discovered / sectionData[feature.id].total) * 100;
	                    icon = L.divIcon({ className: "progressLabel", html: (completePercentage == 100 ? "Completado!" : (completePercentage + "%")), iconAnchor: [15, 10] });
	                    clickFn = function (e) {
	                        map.fitBounds(layer.getBounds());
	                        layer.setStyle({
	                            color: "#fff",
	                            weight: 2,
	                            opacity: 1,
	                            fill: false,
	                            clickable: false
	                        });
	                        //http://static.panoramio.com/photos/original/25514.jpg
	                        //http://mw2.google.com/mw-panoramio/photos/medium/25514.jpg
	                        //http://mw2.google.com/mw-panoramio/photos/small/25514.jpg
	                        //http://mw2.google.com/mw-panoramio/photos/thumbnail/25514.jpg
	                        //http://mw2.google.com/mw-panoramio/photos/square/25514.jpg
	                        //http://mw2.google.com/mw-panoramio/photos/mini_square/25514.jpg

	                        Utils.getJSON("data/progress/pois/" + feature.id + ".json", function (pois) {
	                            FR.UI.drawPOIList(pois);
	                            addPOIThumbnails(pois);
	                            progressLayer.clearLayers();
	                        });
	                    }
	                } else {
	                    // Candado
	                    icon = lockIcon;
	                    clickFn = function (e) { alert("Bloqueado"); }
	                }
	                //L.marker(layer.getBounds().getCenter(), { "icon": icon }).addTo(map).on({ click: clickFn });
	                progressLayer.addLayer(L.marker(layer.getBounds().getCenter(), { "icon": icon }).on({ click: clickFn }));
	                layer.on({ click: clickFn });
	            }
	        }).addTo(map);
	        setInitialPosition();
	    }
	};
	var setInitialPosition = function() {
		map.fitBounds(locationLimitsLayer.getBounds());
	};
	var getCityLimitsBounds = function() {
		return locationLimitsLayer.getBounds();
	};
	var getCityFeatures = function() {
	    //return JSON.parse(localStorage.cityLimits).features[0].geometry.coordinates;
	    //return locationLimitsLayer.getLayers()[0].feature.geometry.coordinates;
	    return locationLimitsLayer.toGeoJSON().features;
	};
	var enableClick = function() {
	    map.on('click', FR.Game.guess);
	};
	var disableClick = function() {
	    map.off('click', FR.Game.guess);
	};
	return {
	    init: init
        , setup: setup
        , getProgressLayer: getProgressLayer
		, getCityLimitsBounds: getCityLimitsBounds
		, getCityFeatures: getCityFeatures
		, enableClick: enableClick
		, disableClick: disableClick
		, addPOIThumbnail: addPOIThumbnail
	}
})();