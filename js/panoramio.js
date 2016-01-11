FR = window.FR || {};
FR.Panoramio = (function() {
	var EVENTS = {
		PHOTOSREADY: "panoramio-photosready"
	};
	var cfg = {
		url: "http://www.panoramio.com/map/get_panoramas.php?set={0}&size={1}&from={2}&to={3}&minx={4}&miny={5}&maxx={6}&maxy={7}&mapfilter=true"
		, blacklist: [13086742, 2510392, 1925188, 8998035, 43361637, 10441955, 258327, 3098072, 12336141, 13252403, 13641870, 9313620, 94060853, 80360104, 18899889, 15537885, 12275742, 19206480, 101869644, 18764285, 49947753, 26024292, 85229762, 9296461, 23455635, 18510223, 17791004, 24928252, 104290387, 40067785, 22156994, 44548466, 76749655, 89041324, 88430180, 62303831, 89041319, 102000119, 4468437, 5152400, 810575, 88809173, 24808943, 88430183, 89332551, 1265808, 4092433, 103851281, 4165014, 67911386, 54492865, 385433, 54492992, 53815919, 85331166, 982913, 25034264, 6823987, 984260, 16024273, 67727559, 87142441, 91583931, 10350870, 70910106, 22846658, 3327557, 23622676, 37130824, 19700255, 31603264, 60845235, 102465409]
		, set: "public" // public || full || userID -> 8710380
		, size: Utils.queryString("size") || "medium" // original || medium || small || thumbnail || square || mini_square
		, maxphotosbyrequest: 50
	};
	var getPanoramas = function (set, size, range, bounds) {
		return Utils.getJSONP(cfg.url.format(set, size, range.start, range.end, bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()), "FR.Panoramio.getPhotos");
	};
	var validatePhotos = function(data) {
		var photos = [];
		if (data.photos.length >= FR.Cfg.numguesses) {
		    var cityLimitFeatures = FR.Map.getCityFeatures();
			data.photos.shuffle();
			for (var p = 0, photo = data.photos[p]; p < data.photos.length; photo = data.photos[++p]) {
			    if (cfg.blacklist.indexOf(photo.photo_id) == -1 && Utils.isInsideFeatures([photo.longitude, photo.latitude], cityLimitFeatures)) {
					photos.push(photo);
					if (photos.length == FR.Cfg.numguesses) {
						break;
					}
				}
			}
		}
		data.photos = photos;
		return (data.photos.length == FR.Cfg.numguesses);
	}
	var getPhotos = function (data) {
		if (!data || !validatePhotos(data)) {
		    getPanoramas(cfg.set, cfg.size, Utils.getRandomRange(0, FR.Game.getPlayLocation().availablePhotos, cfg.maxphotosbyrequest), FR.Map.getCityLimitsBounds());
		} else {
			var event = Utils.createCustomEvent(EVENTS.PHOTOSREADY, {photos: data.photos});
			self.dispatchEvent(event);
		}
	};
	return {
	    getPhotos: getPhotos
        , getPanoramas: getPanoramas
		, EVENTS: EVENTS
	};
})();