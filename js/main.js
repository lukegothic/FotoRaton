// ---FUTURE---
// TODO: Diseno UI + layout API en mobile
// TODO: Mini controles de +/-
// TODO: Favicon (http://realfavicongenerator.net/)
// TODO: Introducir nombre de usuario sin más. (ni siquiera login).
// TODO: Asociar ese usuario a la puntuación final y sacar las 10 mejores puntuaciones del día. (del mes y de siempre). 
// TODO: FLICKR API
// TODO: Generar partida y puntuaciones en servidor 
// TODO: "APUESTA EN TU CIUDAD"
var Panoramix = (function () { 
    // CFG
    var cfg = {
        numguesses: 5
        , ranks: [{
			minscore: 0
			, maxscore: 500
			, name: "GUIRI BEODO"
			, color: "#800080"
        }
        , {
			minscore: 501
			, maxscore: 1250
			, name: "TURISTA ENTENDIDILLO"
			, color: "#FFA500"
        }
        , {
			minscore: 1251
			, maxscore: 3750
			, name: "PAMPLONICA COMUN"
			, color: "#0000FF"
        }
        , {
			minscore: 3751
			, maxscore: 4500
			, name: "HABITUAL DE LA COMARCA"
			, color: "#008000"
        }
        , {
			minscore: 4501
			, maxscore: 5000
			, name: "PTV (Pamplona Toda Vida)"
			, color: "#FF0000"
        }]
        , pamplonageom: null //[[[606239, 4737949, 614387, 4744109]]]
        , maxdistance: 750
        , maxscore: 1000
        , panoramio: {
            url: "http://www.panoramio.com/map/get_panoramas.php?set={0}&size={1}&from={2}&to={3}&minx={4}&miny={5}&maxx={6}&maxy={7}&mapfilter=true&callback=?"
            , set: "public" // public || full || userID -> 8710380
            , size: Utils.queryString("size") || "medium" // original || medium || small || thumbnail || square || mini_square
            , maxphotosbyrequest: 100
            , photosbyset: { // Because get_panoramas.count counts all photos and not just georeferenced ones we have to hardcore the total photos
                "public": 1298
                , "full": 1404
                , "8710380": 1
            }
        }
    };
    // METHODS
    var Map = {
        map: null
        , layer: null
        , clickControl: null
        , init: function () {
        	$.blockUI({message: $("#cargandomapa")});
            Map.map = new TC.Map("mapa", {
                "controls": {
                    "click": {
                        action: Map.drawClick
                    }
                    , "coordinates": false
                }
                , "layout": null
                , "initialExtent": [606239, 4737949, 614387, 4744109]
                , "maxExtent": [600654.7085, 4730500.9655, 620094.7085, 4747980.9655]
                , "workLayers": [{
                    id: "limitemunicipal",
                    type: TC.Consts.layerType.WFS,
                    url: '//idena.tracasa.es/ogc/wfs',
                    version: '1.1.0',
                    outputFormat: TC.Consts.format.JSON,
                    featurePrefix: 'IDENA',
                    geometryName: 'the_geom',
                    featureType: ['DIADMI_Pol_Municipio_VE2015'],
                    properties: [{ name: 'CMUNICIPIO', value: 201, type: TC.Consts.comparison.EQUAL_TO }]
                    , styles: {
                        "polygon": {
                            "strokeWidth": 2
                            , "strokeColor": "#f00"
                            , "fillColor": "transparent"
                            , "fillOpacity": 0
                            , "strokeDashstyle": "5 5"
                        }
                    }
                }, {
                    id: "resultados",
                    type: SITNA.Consts.layerType.VECTOR
                }]
            });
            Map.map.$events.on(TC.Consts.event.MAPLOAD, function (e) {
                Map.clickControl =  Map.map.getControlsByClass(TC.control.Click)[0];
                Map.layer = Map.map.getLayer("resultados");
                Game.start();
            });
        }
        , calculateDistance: function (pointA, pointB) {
            var line = new TC.feature.Polyline([pointA, pointB]);
            return line.wrap.feature.geometry.getLength(); // OL2
        }
        , drawGuess: function (guess, place) {
            Map.map.addMarker(place.point, {
                url: place.photo_file_url
                    , data: { "": place.photo_title }
                    , layer: "resultados"
            });
            Map.map.addMarker(guess, { layer: "resultados" });
            // TODO: No funciona mandando id de layer, mando la capa almacenada
            Map.map.addPolyline([place.point, guess], { layer: Map.getLayer() });
        }
        , drawGuesses: function () {
            for (var g = 0; g < Game.guesses.length; g++) {
                Map.drawGuess(Game.guesses[g], Game.photos[g]);
            }
        }
        , drawPhotos: function() {
            for (var p = 0; p < Game.photos.length; p++) {
                Map.map.addMarker(Game.photos[p].point, {
                    url: Game.photos[p].photo_file_url
                    , layer: "resultados"
                });
            }
        }
        , drawClick: function (coords, screencoords) {
            Game.setState(Game.STATE.GUESSINMAP);
            Map.clear();
            Map.map.addMarker(coords, { layer: "resultados" });
        }
        , getExtentLatLong: function () {
            var extent = Map.map.getExtent();
            var mincr = [extent[0], extent[1]];
            var maxcr = [extent[2], extent[3]];
            mincr = TC.Util.reproject(mincr, Map.map.crs, "EPSG:4326");
            maxcr = TC.Util.reproject(maxcr, Map.map.crs, "EPSG:4326");
            return {
                xmin: mincr[0]
                , ymin: mincr[1]
                , xmax: maxcr[0]
                , ymax: maxcr[1]
            }
        }
        , validateCandidateLocation: function (point) {
            return Utils.isInsidePolygon(point, Map.getPamplona());
        }
        , getCRS: function () {
            return Map.map.crs;
        }
        , getLayer: function () {
            return Map.layer;
        }
        , getGuess: function () {
            return Map.layer.features[0].geometry;
        }
        , clear: function () {
            Map.layer.clearFeatures();
        }
        , enableClick: function () {
            Map.clickControl.activate();
        }
        , disableClick: function () {
            Map.clickControl.deactivate();
        }
        , getPamplona: function () {
            if (!cfg.pamplonageom) {
                if (Map.map.getLayer("limitemunicipal").features && Map.map.getLayer("limitemunicipal").features.length > 0) {
                    cfg.pamplonageom = (Utils.geometryToSimpleCoords(Map.map.getLayer("limitemunicipal").features[0].wrap.feature.geometry));
                } else {
                    // Fallback si falla obtencion de limite municipal
                    // TODO: Seguir events layer WFS y esperar a carga
                    cfg.pamplonageom = [[[606239, 4737949], [606239, 4744109], [614387, 4744109], [614387, 4737949], [606239, 4737949]]]
                }
            }
            return cfg.pamplonageom;
        }
    };
    // PANORAMIO
    var Panoramio = {
        $defer: null
        , getPanoramas: function (set, size, range, extent) {
            //http://www.panoramio.com/wapi/data/get_photos?v=1&key=dummykey&order=date_desc&user=8710380&offset=0&length=37&callback=_callbacks_._1iagjjvto
            //http://www.panoramio.com/map/get_panoramas?order=upload_date&set=8710380&size=thumbnail&from=0&to=24&minx=-1.6711013317108154&miny=42.8100002000044&maxx=-1.6674749851226807&maxy=42.81479190344294&mapfilter=false
            return $.getJSON(cfg.panoramio.url.format(set, size, range.start, range.end, extent.xmin, extent.ymin, extent.xmax, extent.ymax), {});
        }
        , getPhotos: function () {
            if (!Panoramio.$defer) {
                Panoramio.$defer = $.Deferred();
            }
            Panoramio.getPanoramas(cfg.panoramio.set, cfg.panoramio.size, Utils.getRandomRange(0, cfg.panoramio.photosbyset[cfg.panoramio.set], cfg.panoramio.maxphotosbyrequest), Map.getExtentLatLong()).then(function (data) {
                var candidates = Game.processCandidates(data.photos);
                if (candidates.length == cfg.numguesses) {
                    Panoramio.$defer.resolve(candidates);
                    Panoramio.$defer = null;
                } else {
                    Panoramio.getPhotos();
                }
            });
            return Panoramio.$defer;
        }
    };
    // UI
    var UI = {
        $nextButton: null
        , $summaryButton: null
        , $newGameButton: null
        , $guessButton: null
        , $gameData: null
        , $hideshowMapButton: null
        , setup: function () {
            UI.$nextButton = $("#nextButton").unbind("click").on("click", function () {
                Game.nextRound();
            });
            UI.$summaryButton = $("#summaryButton").unbind("click").on("click", function () {
                Game.end();
            });
            UI.$newGameButton = $("#newGameButton").unbind("click").on("click", function () {
                Game.start();
            });
            UI.$guessButton = $("#guessButton").unbind("click").on("click", function () {
                Game.processGuess();
            });
            UI.$gameData = $(".gameData");
            UI.$hideshowMapButton = $("#hideshowMapButton").unbind("click").on("click", function () {
                UI.toggleMap();
            });;
        }
        , toggleMap: function() {
			$("#mapa").toggle();
			UI.$guessButton.toggle();
			if (UI.$hideshowMapButton.val() == "MOSTRAR") {
				UI.$hideshowMapButton.val("OCULTAR").removeClass("corner");
			} else {
				UI.$hideshowMapButton.val("MOSTRAR").addClass("corner");
			}
        }
		, setPhoto: function(photo) {
			var $photo = $("<img>").attr("src", photo.photo_file_url);
			$photo.height($("#photo").height() - 10);
			$("#photo").empty().append($photo);
		}
		, hidePresentation: function() {
			$(".intro").hide();
			$(".page").show();
		}
		, draw: function() {
		    switch (Game.getState()) {
				case Game.STATE.GAMESTART:			
					$("#currentRound").html(1);
					$("#totalRound").html(cfg.numguesses);
					$("#score").html(0);
					$(".logo").addClass("raton");
					$.blockUI({message: $("#cargandofotos")});
				break;
				case Game.STATE.AWAITINGGUESS:
					UI.$guessButton.prop('disabled', true);
					UI.$nextButton.hide();
					UI.$summaryButton.hide();
					UI.$newGameButton.hide();
					UI.$gameData.show();
					UI.$hideshowMapButton.show();
					$.unblockUI();
					UI.setPhoto(Game.getCurrentPhoto());
					$("#currentRound").html(Game.round);
				break;
				case Game.STATE.GUESSINMAP:
					UI.$guessButton.prop('disabled', false);
					UI.$nextButton.hide();
					UI.$summaryButton.hide();
					UI.$newGameButton.hide();
					UI.$gameData.show();
				break;
				case Game.STATE.ROUNDSCORE:
					UI.$guessButton.prop('disabled', true);
					UI.$nextButton.show();
					UI.$summaryButton.hide();
					UI.$newGameButton.hide();
					UI.$gameData.show();
					$("#score").html(Game.score);
					$.blockUI({message: $("#lastRoundSummary")});
				break;
				case Game.STATE.LASTGUESS:
					UI.$guessButton.prop('disabled', true);
					UI.$nextButton.hide();
					UI.$summaryButton.show();
					UI.$newGameButton.hide();
					UI.$gameData.show();
					$("#score").html(Game.score);
					$.blockUI({message: $("#lastRoundSummary")});
				break;
				case Game.STATE.GAMEEND:
					UI.$guessButton.prop('disabled', true);
					UI.$nextButton.hide();
					UI.$summaryButton.hide();
					UI.$newGameButton.show();
					UI.$gameData.show();
					$(".logo").removeClass("raton");
					var widthByScore = Math.floor(Game.score / (cfg.maxscore * cfg.numguesses) * 100);
					var rank = Game.getRank();
					$("#gameScore").width(0).html("");
					$("#rank").hide();
					$.blockUI({message: $("#gameSummary")});
					$("#gameScore").animate({
						width: widthByScore + "%"
					}, widthByScore * 50, function() {
						$("#gameScore").html(Game.score + " puntos");
						$("#rank").fadeIn(2000).html(rank.name).css("color", rank.color);	
						$("#twitterButton").empty();
						twttr.widgets.createShareButton(
						  'http://xn--iruagamejam-3db.com/fotoraton/pamplona/',
						  document.getElementById('twitterButton'),
						  {
							text: "He logrado " + Game.score + " puntos en el juego de #FOTORATON en #PAMPLONA, soy un " + rank.name + ". Juegas? #hacksanfermin"
						  }
						);
					});
					//$("#gameScore").width(+ "%").html(Game.score + " puntos");
					
				break;
			}
		}
    }
    // GAME
    var Game = {
		STATE: {
		    "GAMESTART": "GAMESTART"            // GAME
			, "AWAITINGGUESS": "AWAITINGGUESS"  // GAME
			, "GUESSINMAP": "GUESSINMAP"        // MAP
			, "ROUNDSCORE": "ROUNDSCORE"        // GAME
			, "LASTGUESS": "LASTGUESS"          // GAME
			, "GAMEEND": "GAMEEND"              // GAME
		}
        , photos: null
        , guesses: null
        , round: null
        , lastRoundDistance: null
        , lastRoundScore: null
        , score: null
		, state: null
        , getState: function () {
            return Game.state;
        }
        , setState: function (state) {
            Game.state = state;
            UI.draw();
        }
        , processCandidates: function (candidates) {
            var photos = [];
            if (candidates.length >= cfg.numguesses) {
                candidates = candidates.shuffle();
                var candidate;
                for (var c = 0; c < candidates.length; c++) {
                    candidate = candidates[c];
                    candidate.point = TC.Util.reproject([candidate.longitude, candidate.latitude], "EPSG:4326", Map.getCRS());
                    if (Map.validateCandidateLocation(candidate.point)) {
                        photos.push(candidate);
                        if (photos.length == cfg.numguesses) {
                            break;
                        }
                    }
                }
            }
            return photos;
        }
        , getRank: function() {
        	for (var r = 0, rank = cfg.ranks[r]; r < cfg.ranks.length; r++, rank = cfg.ranks[r]) {
        		if (Game.score <= rank.maxscore) {
        			break;
        		}
        	}
        	return rank;
        }
        , getCurrentPhoto: function() {
            return Game.photos[Game.round - 1];
        }
        , calculateScore: function (distance) {
            var distance = Math.min(distance, cfg.maxdistance);
            var proximity = (cfg.maxdistance - distance) / cfg.maxdistance;
            return Math.round(proximity * cfg.maxscore);
        }
        , resetVariables: function () {
            Game.guesses = [];
            Game.round = 0;
            Game.score = 0;
            Game.lastRoundDistance = 0;
            Game.lastRoundScore = 0;
            Map.clear();
        }
        , setup: function (photos) {
            Game.resetVariables();
            Game.photos = photos;
            UI.setup();
            Game.nextRound();
            $.unblockUI();
        }
        , isLastRound: function() {
            return Game.round == cfg.numguesses;
        }
        , start: function (data) {
            Game.setState(Game.STATE.GAMESTART);
            $.when(Panoramio.getPhotos()).done(Game.setup);
        }
        , nextRound: function () {
            Game.round++;
            Game.setState(Game.STATE.AWAITINGGUESS);
            Map.clear();
            Map.enableClick();
        }
        , processGuess: function () {
            var currentPhoto = Game.getCurrentPhoto();
            var guess = Map.getGuess();
            Game.guesses.push(guess);
            Game.lastRoundDistance = Math.round(Map.calculateDistance(guess, currentPhoto.point));
            Game.lastRoundScore = Game.calculateScore(Game.lastRoundDistance);
            // TODO: Mostrar round score en UI
            Game.score += Game.lastRoundScore;
            $("#lastRoundDistance").html(Game.lastRoundDistance);
            $("#lastRoundScore").html(Game.lastRoundScore);
            if (Game.isLastRound()) {
                Game.setState(Game.STATE.LASTGUESS);
			} else {
                Game.setState(Game.STATE.ROUNDSCORE);
            }
            Map.clear();
            Map.drawGuess(guess, currentPhoto);
            Map.map.zoomToMarkers();
            Map.disableClick();
        }
        , end: function () {
            Game.setState(Game.STATE.GAMEEND);
            Map.clear();
            Map.drawGuesses();
            Map.map.zoomToMarkers();
        }
    };
    return {
        init: function() {
        	UI.hidePresentation();
        	Map.init();
        }
    }
})();
$("#playButton").on("click", function() {
	Panoramix.init();	
});
