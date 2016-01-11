FR = window.FR || {};
FR.UI = (function() {
    var SCENES = {
        "TITLE": document.getElementById("titleScene")
        , "SELECTLOCATION": document.getElementById("selectLocationScene")
		, "GAME": document.getElementById("gameScene")
		//, "SCORE": document.getElementById("scoreScene")
    };
    var HISTORYSTATE = {
        "START": "#start"
        , "PHOTO": "#photo"
        , "MAP": "#map"
        , "ROUNDSCORE": "#roundscore"
        , "FINALSCORE": "#finalscore"
        , "DAILYRANKING": "#dailyranking"
        , "ALLTIMERANKING": "#alltimeranking"
    }
	var flipCanvas = function() {
		document.getElementById('flip-container').classList.toggle('flipped');
		document.getElementById('front').classList.toggle('hidden');
		//document.getElementById('backToPhoto').classList.toggle('hidden');
	};
	var loadScene = function(scene) {
		for (var s in SCENES) {
			if (SCENES[s] == scene) {
				SCENES[s].classList.remove("hidden");
			} else {
				SCENES[s].classList.add("hidden");
			}
		}
	};
	var setup = function () {
	    // TITLE
	    document.getElementById("changeLocation").addEventListener("click", loadSelectLocationScene);
	    document.getElementById("playOnLastLocation").addEventListener("click", FR.Game.start);
	    // LOCATION SELECT
	    document.getElementById("chooseLocation").addEventListener("click", function () {
	        var IDLocation = document.getElementById("locations").value;
	        for (var l = 0, location = locations[l]; l < locations.length; location = locations[++l]) {
	            if (location.code == IDLocation) {
                    FR.Game.setPlayLocation(location);
	                break;
	            }
	        }
	        FR.Game.start();
	    });
	    document.getElementById("photoFull").addEventListener("click", function () { this.classList.add("hidden"); })

	};
	var showPOIList = function () {
	    document.getElementById("photoListContainer").classList.remove("hidden");
	};
	var hidePOIList = function () {
	    document.getElementById("photoListContainer").classList.add("hidden");
	};
	var drawPOIList = function (pois) {
	    // acertados: miniaturas en mapa, estilo activo, nombre en foto
	    // no acertados: estilo no activo, interrogante en foto
	    var ul = document.getElementById("photoList");
	    for (var p = 0; p < pois.length; p++) {
	        (function () {
	            var li, img, span, poi;
	            poi = pois[p];
	            li = document.createElement('li');
	            img = document.createElement('img');
	            img.src = "http://mw2.google.com/mw-panoramio/photos/square/" + poi.id + ".jpg";
	            li.appendChild(img);
	            li.addEventListener("click", function () {
	                if (this.classList.contains("selected")) {
	                    this.classList.remove("selected");
	                    FR.Game.setPOI(null);
	                    FR.Map.disableClick();
	                } else {
	                    document.getElementById("photoBlurred").style.backgroundImage = "url(http://mw2.google.com/mw-panoramio/photos/medium/" + poi.id + ".jpg)";
	                    document.getElementById("photo").style.backgroundImage = "url(http://mw2.google.com/mw-panoramio/photos/medium/" + poi.id + ".jpg)";
	                    document.getElementById("originalphotolink").href = "http://www.panoramio.com/photo/" + poi.id;
	                    document.getElementById("authorlink").href = "http://www.google.com";
	                    document.getElementById("authorlink").innerHTML = "Yo yo yo";
	                    var photoFull = document.getElementById("photoFull");
	                    if (this.classList.contains("discovered")) {
	                        console.log("mostrar info del poi");
	                    }
	                    photoFull.classList.remove("hidden");
	                    var lis = ul.getElementsByTagName("li");
	                    for (var l = 0; l < lis.length; l++) {
	                        lis[l].classList.remove("selected");
	                    }
	                    if (this.classList.contains("unknown")) {
	                        this.classList.add("selected");
	                        // TODO: cambiar cursor
	                        FR.Game.setPOI(poi.id);
	                        FR.Map.enableClick();
	                    }
	                }
	            });
	            span = document.createElement('span');
	            if (poi.discovered) {
	                li.classList.add("discovered");
	                span.innerHTML = poi.name;
	            } else {
	                li.classList.add("unknown");
	                span.innerHTML = "?";
	            }
	            li.appendChild(span);
	            ul.appendChild(li);
	        })();
	    }
	    FR.UI.showPOIList();
	};
	var deactivatePOIS = function () {

	};
	var activatePOI = function () {

	};
	var discoverPOI = function (name) {
		
	}
	var drawCredits = function () {
	    document.getElementById("credits").innerHTML = FR.Game.getCredits();
	};
	var drawPhoto = function() {
	    history.pushState({ "page": HISTORYSTATE.PHOTO }, "", HISTORYSTATE.PHOTO);
	    var photo = FR.Game.getCurrentPhoto();
		document.getElementById("photoBlurred").style.backgroundImage = "url(" + photo.photo_file_url + ")";
		document.getElementById("photo").style.backgroundImage = "url(" + photo.photo_file_url + ")";
		document.getElementById("originalphotolink").href = photo.photo_url;
		document.getElementById("authorlink").href = photo.owner_url;
		document.getElementById("authorlink").innerHTML = photo.owner_name;
	};
	var loadTitleScene = function () {
	    var location = FR.Game.getPlayLocation();
	    var playOnLastLocationButton = document.getElementById("playOnLastLocation");
	    if (location) {
	        playOnLastLocationButton.classList.remove("hidden");
	        playOnLastLocationButton.innerHTML = "Jugar en " + location.name;
	    } else {
	        playOnLastLocationButton.classList.add("hidden");
	    }
		loadScene(SCENES.TITLE);
	};
	var locations;
	var loadSelectLocationScene = function () {
	    FR.Game.setPlayLocation(null);
	    Utils.getJSON("data/location/all.json", function (data) {
	        locations = data.locations;
	        var sel = document.getElementById('locations');
	        for (var l = 0, location = data.locations[l]; l < data.locations.length; location = data.locations[++l]) {
	            var opt = document.createElement('option');
	            opt.innerHTML = location.name;
	            opt.value = location.code;
	            sel.appendChild(opt);
	        }
	        loadScene(SCENES.SELECTLOCATION);
	    });
	};
	var loadGameScene = function (randomModeStatus) {
	    if (randomModeStatus.unlocked) {
	        document.getElementById('randomMode').classList.remove("hidden");
	        document.getElementById('maxScore').innerHTML = randomModeStatus.maxscore;
	        document.getElementById('startRandomGame').addEventListener("click", FR.Game.startRandom);
	    }
	    loadScene(SCENES.GAME);
	};
	var loadScoreScene = function () {
	    history.pushState({ "page": HISTORYSTATE.FINALSCORE }, "", HISTORYSTATE.FINALSCORE);
		// Draw score
		document.getElementById("score").innerHTML = FR.Game.getScore();
		var rank = FR.Game.getRank();
		var rankElm = document.getElementById("rank");
		rankElm.innerHTML = rank.name;
		//rankElm.style.color = rank.color;
		// Load scene
		loadScene(SCENES.SCORE);
	};
	var renderActionBar = function () {
	    switch (FR.Game.getState()) {
	        case FR.Game.STATES.GUESSINMAP:
	            document.getElementById("actionGuess").classList.remove("hidden");
	            document.getElementById("actionNext").classList.add("hidden");
	            //document.getElementById("actionShowRankings").classList.add("hidden");
	            //document.getElementById("actionBackToTitle").classList.add("hidden");
	            document.getElementById("actionReplay").classList.add("hidden");
	            document.getElementById("actionBar").classList.remove("hidden");
	            break;
	        case FR.Game.STATES.ROUNDSCORE:
	            document.getElementById("actionGuess").classList.add("hidden");
	            document.getElementById("actionNext").classList.remove("hidden");
	            //document.getElementById("actionShowRankings").classList.add("hidden");
	            //document.getElementById("actionBackToTitle").classList.add("hidden");
	            document.getElementById("actionReplay").classList.add("hidden");
	            document.getElementById("actionBar").classList.remove("hidden");
	            break;
	        case FR.Game.STATES.END:
	            document.getElementById("actionGuess").classList.add("hidden");
	            document.getElementById("actionNext").classList.add("hidden");
	            //document.getElementById("actionShowRankings").classList.remove("hidden");
	            //document.getElementById("actionBackToTitle").classList.remove("hidden");
	            document.getElementById("actionReplay").classList.remove("hidden");
	            document.getElementById("actionBar").classList.remove("hidden");
	            break;
	        default:
	            document.getElementById("actionBar").classList.add("hidden");
	            break;
	    }
	};
	return {
		setup: setup
		, loadTitleScene: loadTitleScene
		, loadGameScene: loadGameScene
		, loadScoreScene: loadScoreScene
        , drawPOIList: drawPOIList
        , drawPhoto: drawPhoto
        , drawCredits: drawCredits
        , showPOIList: showPOIList
        , hidePOIList: hidePOIList
		, flipCanvas: flipCanvas
        , renderActionBar: renderActionBar
        , activatePOI: activatePOI
        , deactivatePOI: deactivatePOI
        , discoverPOI: discoverPOI
	};
})();