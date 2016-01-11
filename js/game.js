FR = window.FR || {};
FR.Game = (function () {
    var version = "0.2";
    var photos, round, score, state, gameMode, credits, playLocation = null;
    var poi;
	/* GETTERS and SETTERS */
	var setState = function(_state) {
		state = _state;
		FR.UI.renderActionBar();
	};
	var getState = function() {
		return state;	
	};
	var getCurrentPhoto = function() {
		return photos[round - 1];
	};
	var getCurrentPhotoLocation = function () {
		var photo = getCurrentPhoto();
		return L.latLng(photo.latitude, photo.longitude);
	};
	var getGameMode = function () {
	    return gameMode;
	};
	var getRank = function () {
	    var maxscore = FR.Cfg.numguesses * FR.Cfg.maxscore;
	    var scorepercent = (score / maxscore) * 100;
		for (var r = 0, rank = FR.Cfg.ranks[r]; r < FR.Cfg.ranks.length; r++, rank = FR.Cfg.ranks[r]) {
		    if (scorepercent <= rank.maxscore) {
				break;
			}
		}
		return rank;
	};
	var getScore = function() {
		return score;
	};
	var getRound = function () {
	    return round;
	};
	var setPlayLocation = function (location) {
	    playLocation = location;
	};
	var getPlayLocation = function () {
        return playLocation;
	};
	var getSubdomainPlayLocation = function () {
        // TODO: TESTS
	    return window.location.hostname.substring(0, window.location.hostname.indexOf("."));
	};
	var setPOI = function (_poi) {
	    poi = _poi;
	    FR.UI.activatePOI();
	};
	var getPOI = function () {
	    return poi;
	};
	var getCredits = function () {
	    return credits;
	}
	/* Functions */
	var calculateScore = function (distance) {
	    // [0 -> cfg.mindistance] => cfg.maxscore
	    // [cfg.mindistance -> cfg.maxdistance] => score = (2 * cfg.maxdistance) - (2 * distance)
	    var distance = Math.min(distance, FR.Cfg.maxdistance);
	    if (distance <= FR.Cfg.mindistance) {
	        return FR.Cfg.maxscore;
	    } else {
	        return Math.round((2 * FR.Cfg.maxdistance) - (2 * distance));
	    }
	    /*var distance = Math.min(distance, cfg.maxdistance);
        var proximity = (cfg.maxdistance - distance) / cfg.maxdistance;
        return Math.round(proximity * cfg.maxscore);*/
	};
	var guess = function (point) {
	    FR.Map.disableClick();
	    credits--;
	    FR.UI.drawCredits();
	    // TODO: POST point.latlng y poiid (testear bien y mal)
        // Este proceso POST en servidor debe primero restar 1 credito por la accion y despues calcular si el lugar esta cercano a lo enviado
        var poi = getPOI();
	    Utils.getJSON("data/poi/right/" + poi + ".json", function (data) {
	        console.log(data);
	        if (data.discovered) {
	        	FR.UI.deactivatePOI();
	        	FR.UI.discoverPOI(data.name);
        		FR.Map.addPOIThumbnail(data.latitude, data.longitude, "http://mw2.google.com/mw-panoramio/photos/mini_square/" + poi + ".jpg");
        		alert("YEAH")
	        } else {
	            alert("La foto no corresponde al lugar elegido :(");
	        }
	    });
	};
    // DFD #1
	var setup = function () {
	    // Clear local cache if game has new version
	    if ((typeof (Storage) !== "undefined") && ((!localStorage.version) || (localStorage.version != version))) {
	        localStorage.clear();
	        localStorage.version = version;
	    }
	    FR.UI.setup();
        // Obtener informacion del usuario
	    Utils.getJSON("data/user/31201.json", function (data) {
	        credits = data.credits;
	        FR.UI.drawCredits();
	        if (data.credits == 0) {
	            console.info("Creditos 0, mostrando ventana de compra");
	            // TODO: Mostrar opciones conseguir creditos
	        }
	        // Comprobar si viene con subdominio
	        // Subdominio correcto establece el lugar de juego que viene en el subdominio
	        var urlPlayLocation = getSubdomainPlayLocation();
	        if (urlPlayLocation) {
	            console.info("Entrada directa por subdominio [" + urlPlayLocation + "]");
	            if (data.lastplace && data.lastplace.urlcode == urlPlayLocation.toLowerCase()) {
	                console.info("Lugar coincide con ultima partida, estableciendo lugar de juego");
	                setPlayLocation(data.lastplace);
	                start();
	            } else {
	                // TODO: POST <urlPlayLocation>
	                console.info("Lugar no coincide con ultima partida o no existe ultima partida, obteniendo datos del lugar");
	                Utils.getJSON("data/location/" + urlPlayLocation + ".json", function (data) {
	                    console.info("Respuesta recibida")
	                    if (data) {
	                    	console.info("Existen datos, estableciendo lugar de juego");
		                    setPlayLocation(data);
		                    start();
		                } else {
		                	console.info("No existen datos");
		                	FR.UI.loadTitleScene();
		                }
	                });
                }
	        } else {
	            console.info("Entrada general");
	            if (data.lastplace) {
	                console.info("Existe ultima partida, estableciendo lugar de juego");
	                setPlayLocation(data.lastplace);
	            }
	            FR.UI.loadTitleScene();
	        }
	    });
	};
	var start = function () {
	    Utils.getJSON("data/progress/" + playLocation.code + ".json", function (progress) {
	        FR.UI.loadGameScene(progress.modes.random);
	        FR.Map.setup(progress.modes.poi);
	    });
	};
	var startRandom = function () {
	    console.log("random");
	}
	return {
        start: start
        , startRandom: startRandom
		, setup: setup
		, guess: guess
		, getCurrentPhoto: getCurrentPhoto
		, getScore: getScore
		, getRank: getRank
        , getRound: getRound
        , setState: setState
        , getState: getState
        , getPlayLocation: getPlayLocation
        , setPlayLocation: setPlayLocation
        , getPOI: getPOI
        , setPOI: setPOI
        , getCredits: getCredits
	    , calculateScore: calculateScore
	};
})();

	
